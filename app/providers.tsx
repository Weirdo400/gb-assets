"use client";
export const dynamic = "force-dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { Toaster } from "sonner";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PortfolioProvider>
          {children}
          <Toaster position="bottom-right" />
        </PortfolioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
