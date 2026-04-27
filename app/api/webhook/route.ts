import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event } = body as { event?: string };

    // Farcaster miniapp events: added, removed, notifications_enabled, notifications_disabled
    console.log("[webhook] event:", event, body);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
