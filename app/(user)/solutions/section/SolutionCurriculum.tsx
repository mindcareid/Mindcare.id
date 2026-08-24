import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { Solution } from "../type/solution";

type SolutionCurriculumProps = {
  solution: Solution;
};

export default function SolutionCurriculum({
  solution,
}: SolutionCurriculumProps) {
  if (solution.curriculum.length === 0) return null;

  // Judul section menyebut jumlahnya, dan angka itu SENGAJA diambil dari
  // `curriculum.length`, bukan dari `sessionCount` — supaya kalau keduanya
  // pernah berselisih, yang tampil tetap sama dengan yang benar-benar
  // dirender di bawahnya. Harness menjaga keduanya sama; ini lapis kedua.
  const total = solution.curriculum.length;

  return (
    <div>
      <SectionHeader
        title="What's inside"
        description={`${total} ${
          total === 1 ? "session" : "sessions"
        }, ${solution.sessionMinutes} minutes each.`}
        underline
      />

      <ol className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {solution.curriculum.map((session, index) => (
          <li key={session.id} className="flex gap-4 p-5">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-lavender-200 text-sm font-semibold text-secondary"
            >
              {index + 1}
            </span>

            <div className="min-w-0">
              <p className="font-heading text-lg font-semibold text-foreground">
                {session.title}
              </p>
              <p className="mt-1 max-w-prose text-base leading-relaxed text-muted-foreground">
                {session.summary}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
