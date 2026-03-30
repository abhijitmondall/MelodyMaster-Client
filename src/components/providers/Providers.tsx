"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider } from "@/components/ui/toast";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    // Runs only on client after mount — safe to access localStorage
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures the QueryClient is created once per component mount
  // and is stable across re-renders without causing SSR/client mismatches
  const [queryClient] = useState<QueryClient>(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <ToastProvider>{children}</ToastProvider>
      </AuthInitializer>
    </QueryClientProvider>
  );
}
