import { GraduationCap } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { Professional } from "../type/professional";

type ProfessionalEducationProps = {
  professional: Professional;
};

export default function ProfessionalEducation({
  professional,
}: ProfessionalEducationProps) {
  if (professional.education.length === 0) return null;

  const education = [...professional.education].sort((a, b) => b.year - a.year);

  return (
    <div>
      <SectionHeader title="Education" underline />

      <ul className="mt-6 space-y-4">
        {education.map((entry) => (
          <li key={entry.id} className="flex gap-3">
            <GraduationCap
              className="mt-0.5 size-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">{entry.degree}</p>
              <p className="text-sm text-muted-foreground">
                {`${entry.institution} · ${entry.year}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
