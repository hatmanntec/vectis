import { connection, NextResponse } from "next/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * GET /api/health: a simple check that the website can reach the database.
 *
 * It reads the public site name (as any visitor could) and reports only
 * "ok" or "error". It reveals nothing else.
 */
export async function GET() {
  await connection(); // always run at request time, never cached at build

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("website_settings")
      .select("site_name")
      .single();

    if (error || !data) {
      return NextResponse.json({ database: "error" }, { status: 503, headers: noStore });
    }
    return NextResponse.json({ database: "ok" }, { headers: noStore });
  } catch {
    return NextResponse.json({ database: "not configured" }, { status: 503, headers: noStore });
  }
}

const noStore = { "Cache-Control": "no-store" };
