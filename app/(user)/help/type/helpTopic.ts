export type HelpTopicGroup = "using-mindcare" | "legal-safety";

export type HelpTopicStatus = "published" | "draft";

export type HelpTopicIcon =
  | "people"
  | "hospital"
  | "sparkle"
  | "calendar"
  | "article"
  | "verified"
  | "document"
  | "lock"
  | "info"
  | "flag";

export interface HelpTopic {
  id: string;
  slug: string;
  title: string;
  summary: string;
  path: string;
  group: HelpTopicGroup;
  icon: HelpTopicIcon;
  status: HelpTopicStatus;
  createdAt: string;
}
