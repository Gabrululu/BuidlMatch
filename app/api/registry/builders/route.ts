import { NextRequest, NextResponse } from "next/server";
import { supabase, type Builder } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skillsParam = searchParams.get("skills") ?? "";
  const skills = skillsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let query = supabase
    .from("builders")
    .select("*")
    .eq("active", true)
    .limit(6);

  // Filter by overlapping skills when provided
  if (skills.length > 0) {
    query = query.overlaps("skills", skills);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ builders: (data ?? []) as Builder[] });
}
