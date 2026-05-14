import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Move to AI",
  description:
    "Move to AI structure la transformation des processus par l'IA et outille l'execution dans la plateforme.",
  icons: {
    icon: [
      { url: "/favicon.ico",  sizes: "any",    type: "image/x-icon" },
      { url: "/favicon.png",  sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple:    { url: "/favicon.png", sizes: "512x512", type: "image/png" },
  }
};

/** Anti-FOUC: appliqué AVANT l'hydratation React pour éviter le flash de thème */
const ANTI_FOUC_SCRIPT = `(function(){
  try {
    var stored = localStorage.getItem('mta-theme') || 'system';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (stored === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', stored);
  } catch(e) {}
})();`;

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC_SCRIPT }} />
      </head>
      <body className="font-sans text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
