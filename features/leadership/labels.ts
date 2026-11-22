/** Plain-English names used by the Leadership module. */

export type LeadershipCategory = "director" | "executive" | "management";

export const CATEGORY_LABEL: Record<LeadershipCategory, string> = {
  director: "Board of Directors",
  executive: "Executive leadership",
  management: "Management",
};

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as LeadershipCategory[];
