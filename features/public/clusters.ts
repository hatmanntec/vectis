import type { CompanyCard } from "./data";

/**
 * The five business clusters from the VECTIS group profile ("One group, five
 * connected business clusters"), each defined by the sectors the profile
 * places in it.
 *
 * A business joins the cluster of its MAIN sector (set in the CMS under
 * Companies > Sectors). A business whose main sector isn't listed below, or
 * that has no sector yet, appears under "Other businesses", so nothing is
 * ever assigned to a cluster by guesswork. To move a business, change its
 * main sector in the CMS; to change a cluster, edit the sector lists here.
 */
export type ClusterKey = "investment" | "energy" | "industry" | "infrastructure" | "impact";

export type Cluster = {
  key: ClusterKey | "other";
  index: string;
  name: string;
  /** Brand colour used for this cluster's markers and header bands. */
  tone: "indigo" | "teal" | "graphite" | "copper";
  sectors: string[];
};

export const CLUSTERS: Cluster[] = [
  {
    key: "investment",
    index: "01",
    name: "Investment and financial services",
    tone: "indigo",
    sectors: ["investments", "banking-and-financial-services", "insurance"],
  },
  {
    key: "energy",
    index: "02",
    name: "Energy and natural resources",
    tone: "teal",
    sectors: ["oil-and-gas", "mining-and-quarrying"],
  },
  {
    key: "industry",
    index: "03",
    name: "Industry and productive enterprises",
    tone: "graphite",
    sectors: ["agriculture-and-agribusiness", "cement-and-building-materials"],
  },
  {
    key: "infrastructure",
    index: "04",
    name: "Infrastructure and commercial services",
    tone: "graphite",
    sectors: [
      "real-estate-construction-facility-management-and-retail",
      "telecommunications",
      "information-technology",
      "media-and-communications",
      "healthcare-pharmaceuticals-and-services",
      "education-and-vocational-training",
    ],
  },
  {
    key: "impact",
    index: "05",
    name: "Partnerships and social impact",
    tone: "copper",
    sectors: ["foundation-and-social-development"],
  },
];

const OTHER: Cluster = { key: "other", index: "—", name: "Other businesses", tone: "graphite", sectors: [] };

/** The cluster a business belongs to, from its main sector. */
export function clusterOf(company: Pick<CompanyCard, "sectors">): Cluster {
  const main = company.sectors.find((s) => s.primary) ?? company.sectors[0];
  return (main && CLUSTERS.find((c) => c.sectors.includes(main.slug))) || OTHER;
}

/** Businesses grouped by cluster, in cluster order; empty clusters are left out. */
export function groupByCluster<T extends Pick<CompanyCard, "sectors">>(companies: T[]) {
  const groups = [...CLUSTERS, OTHER].map((cluster) => ({ cluster, items: [] as T[] }));
  for (const c of companies) {
    const key = clusterOf(c).key;
    groups.find((g) => g.cluster.key === key)!.items.push(c);
  }
  return groups.filter((g) => g.items.length);
}
