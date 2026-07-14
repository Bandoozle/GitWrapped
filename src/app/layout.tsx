import type { Metadata } from "next";
import localFont from "next/font/local";
import { Figtree, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const delight = localFont({
  src: "../../public/fonts/delight-regular.otf",
  variable: "--font-display",
  display: "swap",
  weight: "400",
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "GitWrapped — Turn GitHub into shareable progress carousels",
  description:
    "Connect a repository and generate a beautiful LinkedIn-ready story carousel in under 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${delight.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
