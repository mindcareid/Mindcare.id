import { Program } from "../types/program";
import ProgramCard from "./ProgramsCard";

interface ProgramsGridProps {
  programs: Program[];
  totalPrograms: number;
}

export default function ProgramsGrid({
  programs,
  totalPrograms,
}: ProgramsGridProps) {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p className="text-gray-600">
            Menampilkan <span className="font-semibold">{programs.length}</span>{" "}
            dari <span className="font-semibold">{totalPrograms}</span> program
          </p>
        </div>
        {programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto w-24 h-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Tidak ada program ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
