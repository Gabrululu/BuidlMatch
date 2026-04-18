import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, type Project } from "@/lib/supabase";

type Body = {
  owner_fid: number;
  title: string;
  plan_json: Record<string, unknown>;
  tx_hash?: string;
  metadata_uri?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;

  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({
      owner_fid: body.owner_fid,
      title: body.title,
      plan_json: body.plan_json,
      tx_hash: body.tx_hash ?? null,
      metadata_uri: body.metadata_uri ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data as Project }, { status: 201 });
}
