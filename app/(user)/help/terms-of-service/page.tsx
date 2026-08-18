import { execornerTerms } from "@/app/auth/data/TermsSection";
import { TermsSection, TermsPart } from "@/app/auth/type/Terms";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function sectionSlug(section: TermsSection) {
  const base = section.number
    ? `${section.number}-${section.title}`
    : section.title;
  return slugify(base);
}
function TermsSectionRenderer({
  section,
  depth = 0,
}: {
  section: TermsSection;
  depth?: number;
}) {
  const HeadingTag = (depth === 0 ? "h2" : "h3") as "h2" | "h3";
  const headingClass =
    depth === 0
      ? "text-xl font-bold text-gray-900 mb-4"
      : "text-lg font-semibold text-gray-800 mt-6 mb-3";

  return (
    <section
      id={sectionSlug(section)}
      className={
        depth === 0
          ? "scroll-mt-24 pb-10 border-b border-gray-100"
          : "scroll-mt-24"
      }
    >
      <HeadingTag className={headingClass}>
        {section.number && (
          <span className="text-gray-400 font-normal mr-2">
            {section.number}.
          </span>
        )}
        {section.title}
      </HeadingTag>

      {section.content?.map((block, i) =>
        block.type === "text" ? (
          <p key={i} className="text-base leading-7 text-gray-600 mb-4">
            {block.body}
          </p>
        ) : (
          <div key={i} className="space-y-3 mb-4">
            {block.intro && (
              <p className="text-base font-medium text-gray-800">
                {block.intro}
              </p>
            )}
            <ul className="list-disc pl-6 space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="text-base leading-7 text-gray-600">
                  {item}
                </li>
              ))}
            </ul>
            {block.outro && (
              <p className="text-sm italic text-gray-500">{block.outro}</p>
            )}
          </div>
        ),
      )}
      {section.subsections?.map((sub, i) => (
        <TermsSectionRenderer
          key={sub.number ?? i}
          section={sub}
          depth={depth + 1}
        />
      ))}
    </section>
  );
}

function TableOfContents({ parts }: { parts: TermsPart[] }) {
  return (
    <div className="mb-12 rounded-2xl border border-gray-100 bg-gray-50 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Table of Contents
      </h2>

      <div className="space-y-5">
        {parts.map((part) => (
          <div key={part.part}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              {part.part} — {part.title}
            </p>
            <ul className="space-y-1.5 pl-1">
              {part.sections.map((section) => (
                <li key={sectionSlug(section)}>
                  <a
                    href={`#${sectionSlug(section)}`}
                    className="text-base font-medium text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    {section.number && `${section.number}. `}
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
function SupportBox() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
      <p className="text-blue-700 leading-7">
        If you have any questions, comments, or concerns regarding these Terms,
        please contact ExeCorner at info@executivecorner.id or (+62) 21 5890
        5593.
      </p>
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last updated: June 2025 · ExeCorner Platform
          </p>
        </div>

        <TableOfContents parts={execornerTerms.parts} />

        {execornerTerms.parts.map((part) => (
          <div key={part.part} className="mb-16">
            <div className="mb-8">
              <span className="text-sm font-semibold uppercase tracking-wide text-blue-500">
                {part.part}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {part.title}
              </h2>
            </div>

            <div className="space-y-10">
              {part.sections.map((section) => (
                <TermsSectionRenderer
                  key={sectionSlug(section)}
                  section={section}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12">
          <SupportBox />
        </div>
      </div>
    </div>
  );
}
