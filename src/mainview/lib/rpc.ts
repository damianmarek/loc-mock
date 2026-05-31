import { Electroview } from "electrobun/view";
import type { LocMockRPCSchema } from "@shared/types";

const rpcInstance = Electroview.defineRPC<LocMockRPCSchema>({
  handlers: {
    requests: {},
    messages: {},
  },
});

new Electroview({ rpc: rpcInstance });

export const rpc = rpcInstance;
