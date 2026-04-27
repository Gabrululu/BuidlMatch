import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://buidl-match.vercel.app";

export const metadata: Metadata = {
  title: "BuidlMatch",
  description: "Infraestructura social para builders latinos en Farcaster",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "BuidlMatch",
    description: "Infraestructura social para builders latinos en Farcaster",
    url: APP_URL,
    siteName: "BuidlMatch",
    images: [{ url: `${APP_URL}/icon.png`, width: 512, height: 512 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
