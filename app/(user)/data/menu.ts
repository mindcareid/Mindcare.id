import { FooterSection, Menudata } from "../type";
import { FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";

export const Menu: Menudata[] = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "Professional",
    link: "/proffesional",
  },
  {
    title: "Care Center",
    link: "/care-center",
  },
  {
    title: "Company",
    link: "/company",
  },
  {
    title: "Events",
    link: "/events",
  },
  {
    title: "Insight",
    link: "/insight",
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
        path: "/care-center",
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
        path: "/insight",
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
        path: "/help/verificaion-policy",
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
