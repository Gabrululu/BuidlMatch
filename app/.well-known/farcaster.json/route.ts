import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://buidl-match.vercel.app";

export async function GET() {
  return NextResponse.json({
    accountAssociation: {
      header:    process.env.FARCASTER_MANIFEST_HEADER    ?? "",
      payload:   process.env.FARCASTER_MANIFEST_PAYLOAD   ?? "",
      signature: process.env.FARCASTER_MANIFEST_SIGNATURE ?? "",
    },
    frame: {
      version:              "1",
      name:                 "BuidlMatch",
      subtitle:             "Tu co-builder en Farcaster",
      description:          "Describe tu idea, obtén un plan completo con IA (diseño, contratos, frontend, GTM), conecta con co-builders latinos y publica tu proyecto onchain en Base.",
      iconUrl:              `${APP_URL}/icon.png`,
      imageUrl:             `${APP_URL}/image.png`,
      heroImageUrl:         `${APP_URL}/og-image.png`,
      splashImageUrl:       `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0f0f23",
      homeUrl:              APP_URL,
      webhookUrl:           `${APP_URL}/api/webhook`,
      primaryCategory:      "developer-tools",
      tags:                 ["web3", "builders", "farcaster", "base", "latam", "ia"],
      tagline:              "Co-Builder con IA para builders latinos",
      buttonTitle:          "Empezar a buidlar",
      ogTitle:              "BuidlMatch – Co-Builder para builders latinos",
      ogDescription:        "Genera un plan con IA, encuentra co-builders y publica onchain en Base.",
      ogImageUrl:           `${APP_URL}/og-image.png`,
      castShareUrl:         `https://warpcast.com/~/compose?text=Encontré+mi+co-builder+en+BuidlMatch+🔨%0Ahttps%3A%2F%2Fbuidl-match.vercel.app`,
    },
  });
}
