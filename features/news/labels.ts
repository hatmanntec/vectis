/** Plain-English names used by the News & Media module. */

export type NewsType = "article" | "press_release" | "announcement" | "industry_update" | "company_news";

export const NEWS_TYPE_LABEL: Record<NewsType, string> = {
  article: "Article",
  press_release: "Press release",
  announcement: "Announcement",
  industry_update: "Industry update",
  company_news: "Company news",
};

export const NEWS_TYPES = Object.keys(NEWS_TYPE_LABEL) as NewsType[];
