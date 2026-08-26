import { FooterSection, Menudata } from "../type";
import { FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";

export const Menu: Menudata[] = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "Professional",
    link: "/professionals",
  },
  {
    title: "Care Center",
    link: "/care-centres",
  },
  {
    title: "Solutions",
    link: "/solutions",
  },
  {
    title: "Events",
    link: "/events",
  },
  {
    title: "Insight",
    link: "/insights",
  },
];

export const FooterMenu: FooterSection[] = [
  {
    title: "Explore",
    items: [
      {
        name: "Professionals",
        path: "/professionals",
      },
      {
        name: "Care Center",
        path: "/care-centres",
      },
      {
        name: "Company",
        path: "/company",
      },
      {
        name: "Events",
        path: "/events",
      },
      {
        name: "Insight",
        path: "/insights",
      },
    ],
  },
  {
    title: "Join with Mindcare",
    items: [
      {
        name: "List your profile",
        path: "/profile",
      },
      {
        name: "Register a Centre",
        path: "/register-company",
      },
      {
        name: "List a Company",
        path: "/company/dahsboard",
      },
      {
        name: "Submit a Event",
        path: "/create-event",
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        name: "About Mindcare",
        path: "/help",
      },
      {
        name: "Contact",
        path: "/#contact",
      },
      {
        name: "Advertise",
        path: "/advertise",
      },
      {
        name: "Partner With Us",
        path: "/partner-with-us",
      },
    ],
  },
  {
    title: "Legal & Safety",
    items: [
      {
        name: "Privacy Policy",
        path: "/help/privacy-policy",
      },
      {
        name: "Terms of service",
        path: "/help/terms-of-service",
      },
      {
        name: "Disclaimer",
        path: "/help/disclaimer",
      },
      {
        name: "Verification Policy",
        // Sebelum 24 Agustus 2026 baris ini berbunyi
        // "/help/verificaion-policy" — salah tulis, dan halamannya juga belum
        // ada. Dua sebab 404 sekaligus, jadi memperbaiki salah tulisnya saja
        // tidak menolong. Alamat ini sekarang harus sama dengan
        // `VERIFICATION_POLICY_PATH` di `data/verification.ts`; ada penjaga tipe
        // di `help/verification-policy/page.tsx` yang menggagalkan build kalau
        // konstanta itu diubah tanpa memindahkan foldernya. Menu ini tidak
        // meng-import konstantanya karena berkas ini murni data dan dipakai
        // komponen klien.
        path: "/help/verification-policy",
      },
      {
        name: "Report A Concern",
        path: "/help/report-concern",
      },
    ],
  },
  {
    title: "Connect With Us",
    social: [
      {
        icon: FaLinkedin,
        link: "https://www.linkedin.com/company/msw-global",
      },
      {
        icon: FaInstagram,
        link: "https://www.instagram.com/mswglobal",
      },
      {
        icon: FaYoutube,
        link: "https://www.youtube.com/@mswglobalevents",
      },
    ],
  },
];
