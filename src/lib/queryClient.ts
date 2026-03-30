import { QueryClient } from "@tanstack/react-query";

/**
 * Factory — called once per Providers mount so SSR and client each get
 * a fresh QueryClient, preventing state leaking between requests.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,  // 5 min
        gcTime: 1000 * 60 * 10,    // 10 min
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Browser-side singleton — keeps the same client across hot reloads
let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always a new client per request
    return makeQueryClient();
  }
  // Browser: reuse or create
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}
