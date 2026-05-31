import { BrowserWindow, BrowserView, ApplicationMenu } from "electrobun/bun";
import { $ } from "bun";
import type { LocMockRPCSchema } from "../shared/types";

const VITE_DEV_PORT = 5173;

const rpc = BrowserView.defineRPC<LocMockRPCSchema>({
  maxRequestTime: 10000,
  handlers: {
    requests: {
      setLocation: async ({ lat, lng }) => {
        try {
          const result = await $`xcrun simctl location booted set ${lat},${lng}`.nothrow();
          if (result.exitCode === 0) {
            return { success: true, message: `Location set to ${lat}, ${lng}` };
          }
          const stderr = result.stderr?.toString().trim() || "Unknown error";
          return { success: false, message: stderr };
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return { success: false, message: msg };
        }
      },
      clearLocation: async () => {
        try {
          const result = await $`xcrun simctl location booted clear`.nothrow();
          if (result.exitCode === 0) {
            return { success: true, message: "Location cleared" };
          }
          const stderr = result.stderr?.toString().trim() || "Unknown error";
          return { success: false, message: stderr };
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return { success: false, message: msg };
        }
      },
    },
    messages: {},
  },
});

ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ label: "Quit", role: "quit" }],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
]);

async function getWindowUrl(): Promise<string> {
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`http://localhost:${VITE_DEV_PORT}`, {
        method: "HEAD",
      });
      if (res.ok) {
        return `http://localhost:${VITE_DEV_PORT}`;
      }
    } catch {}
    await Bun.sleep(500);
  }
  return "views://mainview/index.html";
}

const url = await getWindowUrl();

new BrowserWindow({
  title: "Location Mocker",
  url,
  frame: { x: 0, y: 0, width: 900, height: 640 },
  rpc,
});
