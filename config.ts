import { Config } from "./src/config";

export const defaultConfig: Config = {
  url: "https://www.builder.io/c/docs/developers",
  match: "https://www.builder.io/c/docs/**",
  maxPagesToCrawl: 1000,
  outputFileName: "openaiplayground.json",
  maxTokens: 10000000,
};
