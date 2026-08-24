import { Check } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { Solution } from "../type/solution";

type SolutionOverviewProps = {
  solution: Solution;
};

export default function SolutionOverview({ solution }: SolutionOverviewProps) {
  return (
    <div>
      <SectionHeader title="About this programme" underline />

      {/* `overview` sengaja array paragraf polos, sama seperti `Professional.bio`
          — supaya tidak mendahului keputusan format teks panjang yang masih
          terbuka di prd.md bagian 5. Warnanya `text-muted-foreground` (bukan
          `text-foreground` seperti badan artikel) karena panjangnya cuma dua
          paragraf, bukan bacaan empat menit. */}
      <div className="mt-6 max-w-prose space-y-4">
        {solution.overview.map((paragraph, index) => (
          <p
            key={index}
            className="text-base leading-relaxed text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {solution.whoItIsFor.length > 0 && (
        <div className="mt-10">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Who this is for
          </h3>

          <ul className="mt-4 grid max-w-4xl gap-3 md:grid-cols-2">
            {solution.whoItIsFor.map((item, index) => (
              <li key={index} className="flex gap-3">
                <Check
                  className="mt-0.5 size-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span className="text-base leading-relaxed text-muted-foreground">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
