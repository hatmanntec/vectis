/** Which records can have galleries and documents, and their column in media_links. */
export const OWNER_COLUMN = {
  companies: "company_id",
  investments: "investment_id",
  projects: "project_id",
  news: "news_id",
  leadership: "leadership_id",
} as const;

export type LinkOwner = keyof typeof OWNER_COLUMN;
