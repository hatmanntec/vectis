/** Plain-English names for company classifications and relationship types. */

export type Classification = "group" | "business" | "subsidiary" | "external";
export type RelationshipType = "strategic_partner" | "joint_venture" | "affiliate" | "other";

export const CLASSIFICATIONS: { value: Classification; label: string; help: string }[] = [
  { value: "group", label: "Parent organisation", help: "VECTIS itself, at the top of the group." },
  { value: "business", label: "VECTIS business", help: "One of the VECTIS businesses (a business branch)." },
  { value: "subsidiary", label: "Subsidiary", help: "A company owned by another company in the group." },
  { value: "external", label: "Outside company", help: "Not part of the group, e.g. a company VECTIS invests in or partners with." },
];

export const CLASSIFICATION_LABEL: Record<Classification, string> = Object.fromEntries(
  CLASSIFICATIONS.map((c) => [c.value, c.label]),
) as Record<Classification, string>;

export const RELATIONSHIP_LABEL: Record<RelationshipType, string> = {
  strategic_partner: "Strategic partner",
  joint_venture: "Joint venture",
  affiliate: "Affiliate",
  other: "Other relationship",
};
