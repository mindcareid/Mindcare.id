import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import BackToTop from "./components/BackToTop";
import Script from "next/script";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.execorner.com",
  ),

  title: {
    default: "ExeCorner",
    template: "%s | ExeCorner",
  },

  icons: {
    icon: "/images/logo/favicon.ico",
    apple: "/images/logo/favicon.ico",
  },

  openGraph: {
    title: "ExeCorner",
    description: "HR Training & Capability Marketplace",
    url: "/",
    siteName: "ExeCorner",
    images: [
      {
        url: "/images/logo/favicon.ico",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Providers session={session}>
          {children}
          <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="lazyOnload"
          />
          <BackToTop className="hidden md:block fixed bottom-8 right-8 bg-linear-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300" />
        </Providers>
      </body>
    </html>
  );
}
