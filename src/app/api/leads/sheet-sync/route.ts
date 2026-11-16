import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { fetchAllLeads } from "@/lib/leads";

/**
 * Private, read-only data sync endpoint for the authorized IOJH HR Google Apps Script.
 * Never call this from browser-side JavaScript or include the token in a public URL.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  Vary: "Authorization",
};

function isAuthorized(request: NextRequest): boolean {
  const configured = process.env.IOJH_LEAD_SYNC_SECRET;
  const authorization = request.headers.get("authorization");

  if (!configured || configured.length < 32 || !authorization?.startsWith("Bearer ")) {
    return false;
  }

  const presented = authorization.slice("Bearer ".length);
  const a = Buffer.from(presented, "utf8");
  const b = Buffer.from(configured, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  }

  try {
    // Reuse the server-only Supabase helper; no database key is exposed to Apps Script.
    const leads = await fetchAllLeads();
    return NextResponse.json(
      {
        ok: true,
        count: leads.length,
        generated_at: new Date().toISOString(),
        leads,
      },
      { status: 200, headers: privateHeaders },
    );
  } catch (error) {
    // Do not log the response data, private key or submitted PII.
    console.error(
      "IOJH private lead sync failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "Lead sync unavailable" },
      { status: 503, headers: privateHeaders },
    );
  }
}
