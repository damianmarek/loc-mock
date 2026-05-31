export type LocMockRPCSchema = {
  bun: {
    requests: {
      setLocation: {
        params: { lat: number; lng: number };
        response: { success: boolean; message: string };
      };
      clearLocation: {
        params: {};
        response: { success: boolean; message: string };
      };
      ready: {
        params: {};
        response: {};
      };
    };
    messages: {};
  };
  webview: {
    requests: {};
    messages: {
      updateStatus: {
        params: {
          status: "checking" | "downloading" | "ready" | "error" | "none";
          message?: string;
        };
      };
    };
  };
};
