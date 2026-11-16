import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Uptime probe: 200 when the app can reach its database, 503 otherwise. No data is exposed. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
