import { NextRequest, NextResponse } from "next/server";
import { getDb, type Project } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sql = getDb();
  const rows = (await sql`
    SELECT * FROM projects WHERE id = ${parseInt(params.id, 10)}
  `) as Project[];

  if (!rows[0]) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ project: rows[0] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sql = getDb();
  const { tx_hash } = (await req.json()) as { tx_hash: string };

  const rows = (await sql`
    UPDATE projects SET tx_hash = ${tx_hash}
    WHERE id = ${parseInt(params.id, 10)}
    RETURNING *
  `) as Project[];

  return NextResponse.json({ project: rows[0] });
}
