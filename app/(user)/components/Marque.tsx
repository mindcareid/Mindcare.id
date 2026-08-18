import Image from "next/image";
import Link from "next/link";

type LogoItem =
  | { type: "image"; src: string; alt: string }
  | { type: "text"; content: string; className?: string };

const logos: LogoItem[] = [
  { type: "image", src: "/images/logoMarque/Logo_Edutech.png", alt: "Edutech" },
  {
    type: "text",
    content: "Dicoding",
    className: "font-bold text-blue-600 text-2xl",
  },
  {
    type: "image",
    src: "/images/logoMarque/Logo_Hr_Tech.png",
    alt: "HR_Tech",
  },
  {
    type: "text",
    content: "Gojek",
    className: "font-bold text-green-600 text-2xl",
  },
  {
    type: "image",
    src: "/images/logoMarque/Logo_HRDI_Summit.png",
    alt: "HRDI",
  },
  {
    type: "text",
    content: "Tokopedia",
    className: "font-bold text-emerald-600 text-2xl",
  },
  {
    type: "image",
    src: "/images/logoMarque/Logo_Mindcare.png",
    alt: "Mindcare",
  },
];

function LogoSet() {
  return (
    <>
      {logos.map((logo, i) => (
        <div
          key={i}
          className="flex items-center justify-center min-w-45 px-5 shrink-0"
        >
          {logo.type === "image" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-45 h-32 flex items-center justify-center hover:scale-105 hover:shadow-md transition-all">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={130}
                height={60}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-45 h-32 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all">
              <span className={logo.className || "text-2xl font-semibold"}>
                {logo.content}
              </span>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default function LogoMarquee() {
  return (
    <div className="max-w-7xl mx-auto overflow-hidden bg-transparent py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Our Partners</h2>
        <p className="text-gray-800 mt-2">Trusted by leading organizations</p>
      </div>
      <div className="overflow-hidden">
        <div className="marquee-track flex">
          <LogoSet />
          <LogoSet />
          <LogoSet />
          <LogoSet />
        </div>
      </div>
      <div className="flex justify-center my-6">
        <Link
          href="/partners"
          className=" inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold transition-all duration-300 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-600/30 hover:scale-105"
        >
          See all partners
        </Link>
      </div>
    </div>
  );
}
