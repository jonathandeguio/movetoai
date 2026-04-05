import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Move to AI",
  description:
    "Move to AI structure la transformation des processus par l'IA et outille l'execution dans la plateforme.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.png"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans text-foreground">{children}</body>
    </html>
  );
}
