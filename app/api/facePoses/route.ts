import { Pool } from "@neondatabase/serverless";
import { buildQuery } from "@/lib/query";

export const dynamic = "force-dynamic";

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const q = buildQuery({
    pitch: Number(searchParams.get("pitch") ?? 0),
    yaw: Number(searchParams.get("yaw") ?? 0),
    roll: Number(searchParams.get("roll") ?? 0),
    ageLow: Number(searchParams.get("ageLow") ?? 5),
    ageHigh: Number(searchParams.get("ageHigh") ?? 90),
    gender: searchParams.get("gender") ?? "any",
    emotion: searchParams.get("emotion") ?? "any",
    must: (searchParams.get("must") ?? "").split(",").filter(Boolean),
  });

  try {
    const { rows } = await getPool().query(q);
    return Response.json(rows);
  } catch (e) {
    return Response.json(
      { error: String((e as Error)?.message || e) },
      { status: 500 },
    );
  }
}
