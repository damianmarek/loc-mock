import type { ElectrobunConfig } from "electrobun";
import pkg from "./package.json" with { type: "json" };

export default {
  app: {
    name: "LocMock",
    identifier: "com.damianmarek.locmock",
    version: pkg.version,
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    views: {},
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",
    },
  },
  release: {
    baseUrl:
      "https://github.com/damianmarek/loc-mock/releases/latest/download/",
  },
} satisfies ElectrobunConfig;
