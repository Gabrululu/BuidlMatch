import { NextRequest, NextResponse } from "next/server";
import { getDb, type Builder } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type FrameBody = {
  untrustedData?: {
    buttonIndex?: number;
    state?: string;
  };
};

type FrameState = {
  fid?: number;
  tipAmount?: string;
};

function buildFrame({
  imageUrl,
  postUrl,
  buttons,
  state,
}: {
  imageUrl: string;
  postUrl: string;
  buttons: { label: string; action?: string; target?: string }[];
  state?: string;
}) {
  const buttonMeta = buttons
    .slice(0, 4)
    .map((b, i) => {
      const idx = i + 1;
      const action = b.action ?? "post";
      const lines = [
        `<meta property="fc:frame:button:${idx}" content="${b.label}" />`,
        `<meta property="fc:frame:button:${idx}:action" content="${action}" />`,
      ];
      if (b.target) {
        lines.push(
          `<meta property="fc:frame:button:${idx}:target" content="${b.target}" />`
        );
      }
      return lines.join("\n    ");
    })
    .join("\n    ");

  const stateMeta = state
    ? `<meta property="fc:frame:state" content="${encodeURIComponent(state)}" />`
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta property="og:image" content="${imageUrl}" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:post_url" content="${postUrl}" />
    ${stateMeta}
    ${buttonMeta}
  </head>
  <body></body>
</html>`;
}

function builderImageUrl(b: Builder): string {
  const params = new URLSearchParams({
    username: b.username,
    bio: b.bio,
    skills: b.skills.join(","),
  });
  return `${APP_URL}/api/snap/image?${params.toString()}`;
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const postUrl = `${APP_URL}/api/snap/action`;

  let body: FrameBody = {};
  try {
    body = (await req.json()) as FrameBody;
  } catch {
    // malformed body — treat as fresh spin
  }

  const buttonIndex = body.untrustedData?.buttonIndex ?? 1;

  let state: FrameState = {};
  try {
    const raw = body.untrustedData?.state;
    if (raw) state = JSON.parse(decodeURIComponent(raw)) as FrameState;
  } catch {
    // no prior state
  }

  if (buttonIndex === 1 || !state.fid) {
    const rows = (await sql`
      SELECT * FROM builders WHERE active = true
    `) as Builder[];

    const builder = rows.length
      ? rows[Math.floor(Math.random() * rows.length)]
      : null;

    if (!builder) {
      return new NextResponse(
        buildFrame({
          imageUrl: `${APP_URL}/api/snap/image`,
          postUrl,
          buttons: [{ label: "🎰 Girar" }],
        }),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const tipAmount = state.tipAmount ?? "1";
    const newState: FrameState = { fid: builder.fid, tipAmount };

    return new NextResponse(
      buildFrame({
        imageUrl: builderImageUrl(builder),
        postUrl,
        buttons: [
          { label: "🎰 Otra vez" },
          {
            label: "👤 Seguir",
            action: "link",
            target: `https://warpcast.com/${builder.username
              .replace(/\.eth$/, "")
              .replace(/\.fc$/, "")}`,
          },
          {
            label: `💸 Tip ${tipAmount} USDC`,
            action: "tx",
            target: `${APP_URL}/api/snap/tx?wallet=${builder.wallet}&amount=${tipAmount}`,
          },
        ],
        state: JSON.stringify(newState),
      }),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    buildFrame({
      imageUrl: `${APP_URL}/api/snap/image`,
      postUrl,
      buttons: [{ label: "🎰 Girar" }],
    }),
    { headers: { "Content-Type": "text/html" } }
  );
}
