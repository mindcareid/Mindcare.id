import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="col-span-full flex flex-col justify-center items-center text-center py-10 text-gray-500 text-lg font-medium">
      <Image
        src={"/images/notfound.webp"}
        alt="Page_Not_Found"
        width={600}
        height={500}
        className="mb-4"
      />
      <h1 className="text-4xl font-bold mb-2">
        Oops! Page is unavailable :&#40;{" "}
      </h1>
      <p className="text-gray-600 mb-4">
        Maaf, Halaman yang kamu cari tidak ditemukan.
      </p>
      <Link
        href="/"
        className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
      >
        Back to homepage
      </Link>
    </div>
  );
}
