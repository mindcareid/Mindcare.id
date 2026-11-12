/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      "res.cloudinary.com",
      "avatars.githubusercontent.com",
      "cdn.jsdelivr.net",
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "react-icons/fi",
      "react-icons/io5",
      "react-icons/fa",
      "react-icons/fa6",
      "react-icons/md",
      "react-icons/lu",
      "react-icons/io",
      "react-icons/tb",
      "react-icons/hi2",
      "react-icons/go",
      "react-icons/ai",
      "react-icons/fc",
      "framer-motion",
      "date-fns",
      "date-fns-tz",
      "sonner",
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/react-fontawesome",
    ],
  },

  async headers() {
    return [
      {
        // Aset statis non-hash (logo, dll) bisa diganti di path yang sama.
        // Jangan pakai `immutable`/max-age panjang: 1 menit agar
        // penggantian cepat terlihat, SWR 10 menit untuk beban server.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
