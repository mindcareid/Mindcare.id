export type TermsContentBlock =
  | { type: "text"; body: string }
  | { type: "bullet"; intro?: string; items: string[]; outro?: string };
 
export type TermsSection = {
  number?: string;
  title: string;
  hero?: string;
  content?: TermsContentBlock[];
  subsections?: TermsSection[];
};
 
export type TermsPart = {
  part: string; 
  title: string;
  sections: TermsSection[];
};
 
export type TermsDocument = {
  parts: TermsPart[];
};