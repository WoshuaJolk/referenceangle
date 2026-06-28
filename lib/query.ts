// Builds the SQL for /api/facePoses against the existing Neon `reference` table.
// Columns (lowercase, Postgres-folded): url, pitch, yaw, roll, gender, lowage,
// highage, emotions, issmiling, sunglasses, eyeglasses, beard, mustache,
// eyesopen, mouthopen. Pose values are in degrees, stare's sign convention.

const ALLOWED_GENDERS = ["male", "female", "any"];
const ALLOWED_EMOTIONS = [
  "happy",
  "sad",
  "angry",
  "confused",
  "disgusted",
  "surprised",
  "calm",
  "any",
];
export const ATTRIBUTES = [
  { key: "issmiling", label: "Smiling" },
  { key: "sunglasses", label: "Sunglasses" },
  { key: "eyeglasses", label: "Eyeglasses" },
  { key: "beard", label: "Beard" },
  { key: "mustache", label: "Mustache" },
  { key: "eyesopen", label: "Eyes open" },
  { key: "mouthopen", label: "Mouth open" },
] as const;

const ALLOWED_ATTRS = ATTRIBUTES.map((a) => a.key);

export interface SearchParamsInput {
  pitch?: number;
  yaw?: number;
  roll?: number;
  ageLow?: number;
  ageHigh?: number;
  gender?: string;
  emotion?: string;
  must?: string[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const num = (v: unknown, fallback: number) =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;

export function buildQuery(p: SearchParamsInput): string {
  const pitch = num(p.pitch, 0);
  const yaw = num(p.yaw, 0);
  const roll = num(p.roll, 0);
  const ageLow = num(p.ageLow, 5);
  const ageHigh = num(p.ageHigh, 90);
  const gender = ALLOWED_GENDERS.includes(p.gender || "") ? p.gender! : "any";
  const emotion = ALLOWED_EMOTIONS.includes(p.emotion || "") ? p.emotion! : "any";
  const must = (p.must || [])
    .map((a) => a.toLowerCase())
    .filter((a) => ALLOWED_ATTRS.includes(a as (typeof ALLOWED_ATTRS)[number]));

  const genderClause =
    gender === "any" ? "5 = 5" : `replace(gender, '"', '') = '${cap(gender)}'`;
  const emotionClause =
    emotion === "any" ? "5 = 5" : `strpos(emotions, upper('${emotion}')) > 0`;
  const ageClause = `lowage >= ${ageLow} AND highage <= ${ageHigh}`;
  const mustClause = must.length
    ? "AND " + must.map((a) => `${a} = true`).join(" AND ")
    : "";

  return `
    SELECT url AS src
    FROM (
      SELECT
        replace(url, '"', '') AS url,
        abs(pitch - (${pitch})) + abs(yaw - (${yaw})) + abs(roll - (${roll})) AS dist
      FROM reference
      WHERE roll IS NOT NULL
        AND ${emotionClause}
        AND ${ageClause}
        AND ${genderClause}
        ${mustClause}
    ) sub
    ORDER BY dist ASC
    LIMIT 200
  `;
}
