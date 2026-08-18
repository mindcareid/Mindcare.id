import type { TermsSection } from "../type/Terms";

export default function TermsSectionItem({
  section,
}: {
  section: TermsSection;
}) {
  return (
    <div>
      <p className="text-base font-semibold text-gray-700 uppercase tracking-widest mb-1.5">
        {section.number && `${section.number}. `}
        {section.title}
      </p>
      {section.content?.map((block, i) =>
        block.type === "text" ? (
          <p key={i} className="text-base text-gray-500 leading-relaxed mb-2">
            {block.body}
          </p>
        ) : (
          <div key={i} className={i > 0 ? "mt-4" : ""}>
            {block.intro && (
              <p className="text-base text-gray-500 leading-relaxed mb-2">
                {block.intro}
              </p>
            )}

            <ul className="space-y-1.5">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm text-gray-500 leading-relaxed"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {block.outro && (
              <p className="text-base text-gray-500 leading-relaxed mt-2">
                {block.outro}
              </p>
            )}
          </div>
        ),
      )}

      {/* rekursi — kalau section ini punya subsections (5.4 → 5.4.1 dst),
          render pakai komponen yang sama, tinggal indent sedikit */}
      {section.subsections?.map((sub, i) => (
        <div key={sub.number ?? i} className="ml-4 mt-4">
          <TermsSectionItem section={sub} />
        </div>
      ))}
    </div>
  );
}
