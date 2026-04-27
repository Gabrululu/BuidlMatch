import { NextRequest, NextResponse } from "next/server";
import { getDb, type Builder } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sql = getDb();
  const { searchParams } = new URL(req.url);
  const skillsParam = searchParams.get("skills") ?? "";
  const skills = skillsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const rows = (await sql`
    SELECT * FROM builders WHERE active = true
  `) as Builder[];

  const filtered =
    skills.length > 0
      ? rows.filter((b) => b.skills.some((s) => skills.includes(s)))
      : rows;

  return NextResponse.json({ builders: filtered.slice(0, 6) });
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const body = (await req.json()) as {
    fid: number;
    username: string;
    bio?: string;
    skills: string[];
    wallet: string;
  };

  const rows = (await sql`
    INSERT INTO builders (fid, username, bio, skills, wallet, active)
    VALUES (${body.fid}, ${body.username}, ${body.bio ?? ""}, ${body.skills}, ${body.wallet}, true)
    ON CONFLICT (fid) DO UPDATE SET
      username = EXCLUDED.username,
      bio      = EXCLUDED.bio,
      skills   = EXCLUDED.skills,
      wallet   = EXCLUDED.wallet
    RETURNING *
  `) as Builder[];

  return NextResponse.json({ builder: rows[0] }, { status: 201 });
}
