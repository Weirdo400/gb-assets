import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvidersWrapper from "./client-providers-wrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Global Assets — Investment Brokerage",
  description: "Institutional-grade investment platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ClientProvidersWrapper>{children}</ClientProvidersWrapper>
      </body>
    </html>
  );
}
