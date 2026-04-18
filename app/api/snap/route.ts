import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function frameHtml({
  imageUrl,
  postUrl,
  buttons,
}: {
  imageUrl: string;
  postUrl: string;
  buttons: string[];
}) {
  const buttonMeta = buttons
    .slice(0, 4)
    .map(
      (label, i) =>
        `<meta property="fc:frame:button:${i + 1}" content="${label}" />`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta property="og:title" content="Spin — BuidlMatch" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:post_url" content="${postUrl}" />
    ${buttonMeta}
  </head>
  <body></body>
</html>`;
}

export async function GET(_req: NextRequest) {
  const imageUrl = `${APP_URL}/api/snap/image`;
  const postUrl = `${APP_URL}/api/snap/action`;

  return new NextResponse(
    frameHtml({
      imageUrl,
      postUrl,
      buttons: ["🎰 Girar"],
    }),
    {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
      },
    }
  );
}
