// TEMPORARY one-shot seeding route. Fetches db/seed.sql from the public repo and
// loads it into the runtime DATABASE_URL (a locked Vercel secret) via Neon's
// Pool. Guarded by SEED_KEY. Delete this route + the SEED_KEY env once seeded.
import { Pool } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (!process.env.SEED_KEY || searchParams.get("key") !== process.env.SEED_KEY) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: false, error: "DATABASE_URL not set" }, { status: 500 });
  }
  try {
    const url =
      "https://raw.githubusercontent.com/WoshuaJolk/referenceangle/main/db/seed.sql";
    const text = await fetch(url, { cache: "no-store" }).then((r) => r.text());
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
      // node-postgres simple-query protocol runs all statements in one call.
      await client.query(text);
      const { rows } = await client.query(
        "SELECT count(*)::int AS c FROM reference",
      );
      return Response.json({ ok: true, rows: rows[0].c });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (e) {
    return Response.json(
      { ok: false, error: String((e as Error)?.message || e) },
      { status: 500 },
    );
  }
}
