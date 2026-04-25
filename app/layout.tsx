import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvidersWrapper from "./client-providers-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Global Assets — Investment Brokerage",
  description: "Institutional-grade investment platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Apply theme before first paint — defaults to dark if no preference stored */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var s=localStorage.getItem('gb-theme');if(s!=='light'){document.documentElement.classList.add('dark');}})();` }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ClientProvidersWrapper>{children}</ClientProvidersWrapper>
      </body>
    </html>
  );
}
