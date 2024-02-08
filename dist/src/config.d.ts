import { z } from "zod";
import type { Page } from "playwright";
declare const Page: z.ZodType<Page>;
export declare const configSchema: z.ZodObject<{
    /**
     * URL to start the crawl, if url is a sitemap, it will crawl all pages in the sitemap
     * @example "https://www.builder.io/c/docs/developers"
     * @example "https://www.builder.io/sitemap.xml"
     * @default ""
     */
    url: z.ZodString;
    /**
     * Pattern to match against for links on a page to subsequently crawl
     * @example "https://www.builder.io/c/docs/**"
     * @default ""
     */
    match: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    /**
     * Pattern to match against for links on a page to exclude from crawling
     * @example "https://www.builder.io/c/docs/**"
     * @default ""
     */
    exclude: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    /**
     * Selector to grab the inner text from
     * @example ".docs-builder-container"
     * @default ""
     */
    selector: z.ZodOptional<z.ZodString>;
    /**
     * Don't crawl more than this many pages
     * @default 50
     */
    maxPagesToCrawl: z.ZodNumber;
    /**
     * File name for the finished data
     * @default "output.json"
     */
    outputFileName: z.ZodString;
    /** Optional cookie to be set. E.g. for Cookie Consent */
    cookie: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">]>>;
    /** Optional function to run for each page found */
    onVisitPage: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodObject<{
        page: z.ZodType<Page, z.ZodTypeDef, Page>;
        pushData: z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodPromise<z.ZodVoid>>;
    }, "strip", z.ZodTypeAny, {
        page: Page;
        pushData: (args_0: any, ...args_1: unknown[]) => Promise<void>;
    }, {
        page: Page;
        pushData: (args_0: any, ...args_1: unknown[]) => Promise<void>;
    }>], z.ZodUnknown>, z.ZodPromise<z.ZodVoid>>>;
    /** Optional timeout for waiting for a selector to appear */
    waitForSelectorTimeout: z.ZodOptional<z.ZodNumber>;
    /** Optional resources to exclude
     *
     * @example
     * ['png','jpg','jpeg','gif','svg','css','js','ico','woff','woff2','ttf','eot','otf','mp4','mp3','webm','ogg','wav','flac','aac','zip','tar','gz','rar','7z','exe','dmg','apk','csv','xls','xlsx','doc','docx','pdf','epub','iso','dmg','bin','ppt','pptx','odt','avi','mkv','xml','json','yml','yaml','rss','atom','swf','txt','dart','webp','bmp','tif','psd','ai','indd','eps','ps','zipx','srt','wasm','m4v','m4a','webp','weba','m4b','opus','ogv','ogm','oga','spx','ogx','flv','3gp','3g2','jxr','wdp','jng','hief','avif','apng','avifs','heif','heic','cur','ico','ani','jp2','jpm','jpx','mj2','wmv','wma','aac','tif','tiff','mpg','mpeg','mov','avi','wmv','flv','swf','mkv','m4v','m4p','m4b','m4r','m4a','mp3','wav','wma','ogg','oga','webm','3gp','3g2','flac','spx','amr','mid','midi','mka','dts','ac3','eac3','weba','m3u','m3u8','ts','wpl','pls','vob','ifo','bup','svcd','drc','dsm','dsv','dsa','dss','vivo','ivf','dvd','fli','flc','flic','flic','mng','asf','m2v','asx','ram','ra','rm','rpm','roq','smi','smil','wmf','wmz','wmd','wvx','wmx','movie','wri','ins','isp','acsm','djvu','fb2','xps','oxps','ps','eps','ai','prn','svg','dwg','dxf','ttf','fnt','fon','otf','cab']
     */
    resourceExclusions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Optional maximum file size in megabytes to include in the output file
     * @example 1
     */
    maxFileSize: z.ZodOptional<z.ZodNumber>;
    /** Optional maximum number tokens to include in the output file
     * @example 5000
     */
    maxTokens: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    url: string;
    match: (string | string[]) & (string | string[] | undefined);
    maxPagesToCrawl: number;
    outputFileName: string;
    exclude?: string | string[] | undefined;
    selector?: string | undefined;
    cookie?: {
        value: string;
        name: string;
    } | {
        value: string;
        name: string;
    }[] | undefined;
    onVisitPage?: ((args_0: {
        page: Page;
        pushData: (args_0: any, ...args_1: unknown[]) => Promise<void>;
    }, ...args_1: unknown[]) => Promise<void>) | undefined;
    waitForSelectorTimeout?: number | undefined;
    resourceExclusions?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxTokens?: number | undefined;
}, {
    url: string;
    match: (string | string[]) & (string | string[] | undefined);
    maxPagesToCrawl: number;
    outputFileName: string;
    exclude?: string | string[] | undefined;
    selector?: string | undefined;
    cookie?: {
        value: string;
        name: string;
    } | {
        value: string;
        name: string;
    }[] | undefined;
    onVisitPage?: ((args_0: {
        page: Page;
        pushData: (args_0: any, ...args_1: unknown[]) => Promise<void>;
    }, ...args_1: unknown[]) => Promise<void>) | undefined;
    waitForSelectorTimeout?: number | undefined;
    resourceExclusions?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxTokens?: number | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
export {};
//# sourceMappingURL=config.d.ts.map