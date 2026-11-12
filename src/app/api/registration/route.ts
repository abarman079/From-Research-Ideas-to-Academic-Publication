import { NextRequest, NextResponse } from "next/server";
import {
  cleanText,
  insertLead,
  normalizeBdMobile,
  parseLeadSource,
} from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function result(message: string, status: number, code: string) {
  return NextResponse.json(
    { message, code },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

async function verifyTurnstile(token: string, host: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret || !token || token.length > 2048) {
    return false;
  }

  const form = new URLSearchParams({
    secret,
    response: token,
  });

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return false;
  }

  const outcome = (await response.json()) as {
    success?: boolean;
    hostname?: string;
  };

  return outcome.success === true && outcome.hostname === host;
}

export async function POST(request: NextRequest) {
  try {
    // Verify required server-side configuration.
    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.TURNSTILE_SECRET_KEY
    ) {
      return result(
        "Registration is temporarily unavailable. Please try later.",
        503,
        "unavailable",
      );
    }

    // Restrict submissions to the same website origin.
    const origin = request.headers.get("origin");

    if (origin !== request.nextUrl.origin) {
      return result("Request not permitted.", 403, "origin");
    }

    // Accept JSON requests only.
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return result("Invalid request.", 415, "content_type");
    }

    // Reject oversized requests.
    if (Number(request.headers.get("content-length") || 0) > 10000) {
      return result("Request too large.", 413, "too_large");
    }

    const raw = await request.text();

    if (raw.length > 10000) {
      return result("Request too large.", 413, "too_large");
    }

    const data: unknown = JSON.parse(raw);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return result("Invalid request.", 400, "invalid");
    }

    const fields = data as Record<string, unknown>;

    // Validate and sanitize registration information.
    const full_name = cleanText(fields.name, 100);
    const university = cleanText(fields.university, 140);
    const department = cleanText(fields.department, 100);
    const profession = cleanText(fields.profession, 80);

    const phone_e164 =
      typeof fields.phone === "string" ? normalizeBdMobile(fields.phone) : null;

    if (
      !full_name ||
      !university ||
      !department ||
      !profession ||
      !phone_e164 ||
      fields.consent !== true
    ) {
      return result(
        "Please complete every field and agree to the contact notice.",
        422,
        "validation",
      );
    }

    // Verify Cloudflare Turnstile before accessing Supabase.
    if (
      typeof fields.turnstileToken !== "string" ||
      !(await verifyTurnstile(fields.turnstileToken, request.nextUrl.hostname))
    ) {
      return result(
        "Security verification expired or failed. Please try again.",
        400,
        "verification",
      );
    }

    // Save the registration in Supabase.
    const stored = await insertLead({
      full_name,
      phone_e164,
      university,
      department,
      profession,
      source: parseLeadSource(fields.source),
    });

    // The database enforces unique phone numbers.
    if (stored === "duplicate") {
      return result(
        "This phone number is already registered.",
        409,
        "duplicate",
      );
    }

    if (stored !== "created") {
      return result(
        "We could not save your details right now.",
        503,
        "storage",
      );
    }

    return result(
      "Registration received. Our team may contact you about the IOJH book.",
      201,
      "created",
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return result("Invalid request.", 400, "invalid_json");
    }

    console.error(
      "Lead registration failed",
      error instanceof Error ? error.message : "unknown",
    );

    return result(
      "Registration is temporarily unavailable. Please try later.",
      503,
      "unavailable",
    );
  }
}
