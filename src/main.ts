import { defaultConfig } from "../config.js";
import { crawl, write } from "./core.js";
import fs from "fs";
import parse from "csv-parser";

async function readCSV(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let urls: string[] = []; // Explicitly declare urls as an array of strings
    fs.createReadStream(filePath)
      .pipe(parse())
      .on("data", (data) => urls.push(data["module url"]))
      .on("end", () => resolve(urls))
      .on("error", (error) => reject(error));
  });
}

async function main() {
  const urls = await readCSV("src/tocrawl.csv"); // Update path as needed
  // Assuming your config expects an array of URLs. Adjust as per your actual config needs.
  for (const url of urls) {
    defaultConfig.url = url;
    defaultConfig.match = url + "/**";
    await crawl(defaultConfig);
    await write(defaultConfig);
  }
}

main();
