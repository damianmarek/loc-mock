import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Location Mocker",
    identifier: "dev.locmock.app",
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
