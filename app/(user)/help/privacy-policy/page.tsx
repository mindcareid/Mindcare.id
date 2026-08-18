// import { PrivacyPolicy } from "@/app/auth/data/TermsSection";
// import type { TermsSection } from "@/app/auth/type/Terms";
// function slugify(text: string) {
//   return text
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)/g, "");
// }

// function PrivacyPolicyRenderer({ section }: { section: TermsSection }) {
//   if (section.type === "support") {
//     return (
//       <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
//         <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>

//         <p className="text-blue-700 leading-7">{section.bodySupport}</p>
//       </div>
//     );
//   }

//   return (
//     <section
//       id={slugify(section.title)}
//       className="scroll-mt-24 pb-10 border-b border-gray-100"
//     >
//       <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>

//       {section.type === "text" && (
//         <p className="text-base leading-7 text-gray-600">{section.body}</p>
//       )}

//       {section.type === "bullet" && (
//         <div className="space-y-5">
//           {section.group.map((group, index) => (
//             <div key={index}>
//               {group.intro && (
//                 <h3 className="text-base font-semibold text-gray-800 mb-3">
//                   {group.intro}
//                 </h3>
//               )}

//               <ul className="list-disc pl-6 space-y-2">
//                 {group.items.map((item, itemIndex) => (
//                   <li
//                     key={itemIndex}
//                     className="text-base leading-7 text-gray-600"
//                   >
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}

//           {section.outro && (
//             <p className="text-sm italic text-gray-500">{section.outro}</p>
//           )}
//         </div>
//       )}
//     </section>
//   );
// }

// export default function PrivacyPolicyUser() {
//   const mainSections = PrivacyPolicy.filter(
//     (section) => section.type !== "support",
//   );

//   const supportSections = PrivacyPolicy.filter(
//     (section) => section.type === "support",
//   );

//   return (
//     <div className="bg-white">
//       <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
//         <div className="mb-12 border-b border-gray-100 pb-8">
//           <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
//             Privacy Policy
//           </h1>

//           <p className="mt-3 text-sm text-gray-500">
//             Last updated: June 2025 · ExeCorner Platform
//           </p>
//         </div>
//         <div className="mb-12 rounded-2xl border border-gray-100 bg-gray-50 p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">
//             Table of Contents
//           </h2>

//           <ul className="space-y-2">
//             {mainSections.map((section, index) => (
//               <li key={index}>
//                 <a
//                   href={`#${slugify(section.title)}`}
//                   className="text-base font-semibold text-blue-500 hover:text-blue-700 transition-colors"
//                 >
//                   {section.title}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div className="space-y-10">
//           {mainSections.map((section, index) => (
//             <PrivacyPolicyRenderer key={index} section={section} />
//           ))}
//         </div>
//         {supportSections.length > 0 && (
//           <div className="mt-12">
//             {supportSections.map((section, index) => (
//               <PrivacyPolicyRenderer key={index} section={section} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import NotFound from "../../not-found";

export default function PrivacyPolicy() {
  return (
    <div>
      <NotFound />
    </div>
  );
}
