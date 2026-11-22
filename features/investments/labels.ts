/** Plain-English names used by the Investments module. */

export type Nature = "portfolio_investment" | "equity_stake" | "joint_venture" | "strategic_investment" | "other";
export type InvestmentStatus = "active" | "pending" | "exited";

export const NATURE_LABEL: Record<Nature, string> = {
  portfolio_investment: "Portfolio investment",
  equity_stake: "Equity stake",
  joint_venture: "Joint venture",
  strategic_investment: "Strategic investment",
  other: "Other",
};

export const INVESTMENT_STATUS_LABEL: Record<InvestmentStatus, string> = {
  active: "Active",
  pending: "Pending",
  exited: "Exited",
};

export const CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const;

/** e.g. "Vectis Global Investment → Pillar Oil" */
export const investmentTitle = (investor: string, investee: string) => `${investor} → ${investee}`;
