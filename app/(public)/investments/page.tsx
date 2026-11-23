import { redirect } from "next/navigation";

/** Investments are listed on the Investment Philosophy page. */
export default function InvestmentsIndex() {
  redirect("/investment-philosophy#investments");
}
