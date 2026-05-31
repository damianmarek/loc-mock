import { Electroview } from "electrobun/view";
import type { LocMockRPCSchema } from "@shared/types";
import { toast } from "sonner";

let toastId: string | number | undefined;

const rpcInstance = Electroview.defineRPC<LocMockRPCSchema>({
  handlers: {
    requests: {},
    messages: {
      updateStatus: ({ params: { status, message } }) => {
        toast.dismiss(toastId);
        switch (status) {
          case "checking":
            toastId = toast.loading("Checking for updates...");
            break;
          case "downloading":
            toastId = toast.loading("Downloading update...");
            break;
          case "ready":
            toastId = toast.success("Update ready! Restarting...");
            break;
          case "error":
            toastId = toast.error(message || "Update failed");
            break;
        }
      },
    },
  },
});

new Electroview({ rpc: rpcInstance });

rpcInstance.request.ready({});

export const rpc = rpcInstance;
