import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Location Mocker",
    identifier: "com.damianmarek.locmock",
    version: "0.1.0",
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
} satisfies ElectrobunConfig;
