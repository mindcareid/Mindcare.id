import { Program } from "../types/program";
import Link from "next/link";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 bg-linear-to-br from-blue-500 to-purple-600">
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
          {program.level}
        </div>
      </div>
      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {program.subCategory}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{program.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {program.description}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          Instruktur: {program.instructor}
        </p>
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{program.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{program.students.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{program.duration}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {program.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              Rp {(program.price / 1000000).toFixed(1)}jt
            </span>
          </div>
          <Link
            href={`/programs/${program.slug}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
