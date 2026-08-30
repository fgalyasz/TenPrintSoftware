// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tenprintsoftware.com",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  image: {
    responsiveStyles: true,
  },
  devToolbar: {
    enabled: false,
  },
});
