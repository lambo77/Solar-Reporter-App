import { NextResponse } from "next/server";
import { getDailyReadings, summarise, SYSTEM_CONFIG } from "@/lib/solar-data";

/**
 * GET /api/solar?days=30
 * Returns sample solar readings, summary stats and system config.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = Number(searchParams.get("days"));
  const days = Number.isFinite(parsed)
    ? Math.min(365, Math.max(1, Math.trunc(parsed)))
    : 30;

  const readings = getDailyReadings(days);

  return NextResponse.json({
    config: SYSTEM_CONFIG,
    summary: summarise(readings),
    readings,
  });
}
