import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import BackToTop from "./components/BackToTop";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// Inter = body, Playfair Display = heading. Lihat design.md pasal 4.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// TODO(diaze): title & description masih perlu persetujuan atasan.
// Ikon juga masih favicon ExeCorner — menunggu file logo MindCare.id resmi.
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

  icons: {
    icon: "/images/logo/favicon.ico",
    apple: "/images/logo/favicon.ico",
  },

  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
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
    <html
      lang="en"
      className={cn("font-sans", inter.variable, playfair.variable)}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers session={session}>
          {children}
          <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="lazyOnload"
          />
          <BackToTop className="hidden md:block fixed bottom-8 right-8 bg-linear-to-r from-primary to-secondary text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300" />
        </Providers>
      </body>
    </html>
  );
}
