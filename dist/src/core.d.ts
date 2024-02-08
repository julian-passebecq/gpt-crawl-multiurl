/// <reference types="node" />
import { Config } from "./config.js";
import { Page } from "playwright";
import { PathLike } from "fs";
export declare function getPageHtml(page: Page, selector?: string): Promise<string>;
export declare function waitForXPath(page: Page, xpath: string, timeout: number): Promise<void>;
export declare function crawl(config: Config): Promise<void>;
export declare function write(config: Config): Promise<string>;
export default class GPTCrawlerCore {
    config: Config;
    constructor(config: Config);
    crawl(): Promise<void>;
    write(): Promise<PathLike>;
}
//# sourceMappingURL=core.d.ts.map