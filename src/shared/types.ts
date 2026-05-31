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
    };
    messages: {};
  };
  webview: {
    requests: {};
    messages: {};
  };
};
