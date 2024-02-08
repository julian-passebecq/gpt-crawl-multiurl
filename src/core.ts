// core.ts

// Import necessary modules and types
import { PlaywrightCrawler, downloadListOfUrls } from "crawlee";
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { Config, configSchema } from "./config.js";
import { Page } from "playwright";
import { isWithinTokenLimit } from "gpt-tokenizer";
import { PathLike } from "fs";

// Initialize page counter and crawler instance
let pageCounter = 0;
let crawler: PlaywrightCrawler;

// Function to extract HTML from a page based on a selector
export function getPageHtml(page: Page, selector = "body") {
  return page.evaluate((selector) => {
    if (selector.startsWith("/")) {
      // XPath handling
      const elements = document.evaluate(
        selector,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      let result = elements.iterateNext();
      return result ? result.textContent || "" : "";
    } else {
      // CSS Selector handling
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.innerText || "";
    }
  }, selector);
}

// Function to wait for an XPath element
export async function waitForXPath(page: Page, xpath: string, timeout: number) {
  await page.waitForFunction(
    (xpath) => {
      const elements = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      return elements.iterateNext() !== null;
    },
    xpath,
    { timeout },
  );
}

// Main crawl function
export async function crawl(config: Config) {
  configSchema.parse(config);

  if (process.env.NO_CRAWL !== "true") {
    crawler = new PlaywrightCrawler({
      async requestHandler({ request, page, enqueueLinks, log, pushData }) {
        const title = await page.title();
        pageCounter++;
        log.info(
          `Crawling: Page ${pageCounter} / ${config.maxPagesToCrawl} - URL: ${request.loadedUrl}...`,
        );

        // Custom handling for selector
        if (config.selector) {
          if (config.selector.startsWith("/")) {
            await waitForXPath(
              page,
              config.selector,
              config.waitForSelectorTimeout ?? 1000,
            );
          } else {
            await page.waitForSelector(config.selector, {
              timeout: config.waitForSelectorTimeout ?? 1000,
            });
          }
        }

        const html = await getPageHtml(page, config.selector);
        await pushData({ title, url: request.loadedUrl, html });

        if (config.onVisitPage) {
          await config.onVisitPage({ page, pushData });
        }

        // Extract and enqueue links
        await enqueueLinks({
          globs:
            typeof config.match === "string" ? [config.match] : config.match,
          exclude:
            typeof config.exclude === "string"
              ? [config.exclude]
              : config.exclude ?? [],
        });
      },
      maxRequestsPerCrawl: config.maxPagesToCrawl,
      preNavigationHooks: [
        async ({ request, page, log }) => {
          const RESOURCE_EXCLUSIONS = config.resourceExclusions ?? [];
          if (RESOURCE_EXCLUSIONS.length === 0) return;

          if (config.cookie) {
            const cookies = (
              Array.isArray(config.cookie) ? config.cookie : [config.cookie]
            ).map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
              url: request.loadedUrl,
            }));
            await page.context().addCookies(cookies);
          }

          await page.route(`**\/*.{${RESOURCE_EXCLUSIONS.join()}}`, (route) =>
            route.abort("aborted"),
          );
          log.info(`Aborting requests for resource excluded routes.`);
        },
      ],
    });

    const isUrlASitemap = /sitemap.*\.xml$/.test(config.url || ""); // Handle potential undefined URL

    if (isUrlASitemap) {
      const listOfUrls = await downloadListOfUrls({ url: config.url || "" }); // Handle potential undefined URL
      await crawler.addRequests(listOfUrls);
      await crawler.run();
    } else {
      await crawler.run([config.url || ""]); // Handle potential undefined URL
    }
  }
}

// Function to write crawl results to file
export async function write(config: Config) {
  let nextFileNameString: PathLike = "";
  const jsonFiles = await glob("storage/datasets/default/*.json", {
    absolute: true,
  });

  console.log(`Found ${jsonFiles.length} files to combine...`);

  let currentResults: Record<string, any>[] = [];
  let currentSize: number = 0;
  let fileCounter: number = 1;
  const maxBytes: number = config.maxFileSize
    ? config.maxFileSize * 1024 * 1024
    : Infinity;

  const getStringByteSize = (str: string): number =>
    Buffer.byteLength(str, "utf-8");

  const nextFileName = (): string =>
    `${config.outputFileName.replace(/\.json$/, "")}-${fileCounter}.json`;

  const writeBatchToFile = async (): Promise<void> => {
    nextFileNameString = nextFileName();
    await writeFile(
      nextFileNameString,
      JSON.stringify(currentResults, null, 2),
    );
    console.log(
      `Wrote ${currentResults.length} items to ${nextFileNameString}`,
    );
    currentResults = [];
    currentSize = 0;
    fileCounter++;
  };

  let estimatedTokens: number = 0;

  const addContentOrSplit = async (
    data: Record<string, any>,
  ): Promise<void> => {
    const contentString: string = JSON.stringify(data);
    const tokenCount: number | false = isWithinTokenLimit(
      contentString,
      config.maxTokens || Infinity,
    );

    if (typeof tokenCount === "number") {
      if (estimatedTokens + tokenCount > config.maxTokens!) {
        if (currentResults.length > 0) await writeBatchToFile();
        estimatedTokens = Math.floor(tokenCount / 2);
        currentResults.push(data);
      } else {
        currentResults.push(data);
        estimatedTokens += tokenCount;
      }
    }

    currentSize += getStringByteSize(contentString);
    if (currentSize > maxBytes) await writeBatchToFile();
  };

  for (const file of jsonFiles) {
    const fileContent = await readFile(file, "utf-8");
    const data: Record<string, any> = JSON.parse(fileContent);
    await addContentOrSplit(data);
  }

  if (currentResults.length > 0) await writeBatchToFile();

  return nextFileNameString;
}

// Export GPTCrawlerCore class
export default class GPTCrawlerCore {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async crawl() {
    await crawl(this.config);
  }

  async write(): Promise<PathLike> {
    return new Promise((resolve, reject) => {
      write(this.config)
        .then((outputFilePath) => resolve(outputFilePath))
        .catch(reject);
    });
  }
}
