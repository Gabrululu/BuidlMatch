import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  return NextResponse.json({
    // Fill accountAssociation after running:
    // npx @farcaster/create-miniapp sign-manifest --domain your-domain.vercel.app
    accountAssociation: {
      header: process.env.FARCASTER_MANIFEST_HEADER ?? "",
      payload: process.env.FARCASTER_MANIFEST_PAYLOAD ?? "",
      signature: process.env.FARCASTER_MANIFEST_SIGNATURE ?? "",
    },
    frame: {
      version: "1",
      name: "BuidlMatch",
      iconUrl: `${APP_URL}/icon.png`,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0f0f23",
      homeUrl: APP_URL,
    },
  });
}
