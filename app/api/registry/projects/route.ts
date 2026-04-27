import { NextRequest, NextResponse } from "next/server";
import { getDb, type Project } from "@/lib/db";

type Body = {
  owner_fid: number;
  title: string;
  plan_json: Record<string, unknown>;
  tx_hash?: string;
  metadata_uri?: string;
};

export async function POST(req: NextRequest) {
  const sql = getDb();
  const body = (await req.json()) as Body;

  const rows = (await sql`
    INSERT INTO projects (owner_fid, title, plan_json, tx_hash, metadata_uri)
    VALUES (
      ${body.owner_fid},
      ${body.title},
      ${JSON.stringify(body.plan_json)},
      ${body.tx_hash ?? null},
      ${body.metadata_uri ?? null}
    )
    RETURNING *
  `) as Project[];

  return NextResponse.json({ project: rows[0] }, { status: 201 });
}
