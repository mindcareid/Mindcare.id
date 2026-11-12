import type { Metadata } from "next";
import "./globals.css";
import BackToTop from "./components/BackToTop";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import SessionBootstrap from "./components/SessionBootstrap";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_NAME = "MindCare.id";
const SITE_DESCRIPTION =
  "Mental-health professionals, care centres, solutions and insights in Indonesia.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mindcare.id",
  ),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/images/logo/MindcareLogo.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", jakarta.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SessionBootstrap>{children}</SessionBootstrap>
        <Script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          strategy="lazyOnload"
        />
        <BackToTop className="hidden md:block fixed bottom-8 right-8 bg-linear-to-r from-primary to-secondary text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300" />
      </body>
    </html>
  );
}
