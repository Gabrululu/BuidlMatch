import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const bg = "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f1628 100%)";
const purple = "#7c3aed";
const blue = "#2563eb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const bio = searchParams.get("bio") ?? "";
  const skills = searchParams.get("skills") ?? "";

  if (!username) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: bg, fontFamily: "sans-serif", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${purple}, ${blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              🌀
            </div>
            <span style={{ display: "flex", color: "#a78bfa", fontSize: 20, fontWeight: 600, letterSpacing: 2 }}>
              SPIN — BUIDLMATCH
            </span>
          </div>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 48, fontWeight: 800, textAlign: "center", maxWidth: 700 }}>
            Descubre builders latinos
          </div>
          <div style={{ display: "flex", color: "#94a3b8", fontSize: 22, textAlign: "center", maxWidth: 600 }}>
            Gira la ruleta y conecta con el ecosistema
          </div>
          <div style={{ display: "flex", marginTop: 8, background: `linear-gradient(135deg, ${purple}, ${blue})`, color: "white", borderRadius: 16, padding: "14px 40px", fontSize: 22, fontWeight: 700 }}>
            🎰 Girar →
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const skillList = skills ? skills.split(",").slice(0, 4) : [];
  const bioText = bio.length > 100 ? bio.slice(0, 97) + "…" : bio;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: bg, fontFamily: "sans-serif", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ display: "flex", color: "#a78bfa", fontSize: 16, letterSpacing: 2 }}>SPIN — BUIDLMATCH</span>
        </div>
        <div style={{ display: "flex", width: 96, height: 96, borderRadius: "50%", background: `linear-gradient(135deg, ${purple}, ${blue})`, alignItems: "center", justifyContent: "center", fontSize: 40, border: "3px solid #a78bfa" }}>
          🏗️
        </div>
        <div style={{ display: "flex", color: "#ffffff", fontSize: 36, fontWeight: 800 }}>
          @{username}
        </div>
        {bioText ? (
          <div style={{ display: "flex", color: "#94a3b8", fontSize: 18, textAlign: "center", maxWidth: 700 }}>
            {bioText}
          </div>
        ) : null}
        {skillList.length > 0 ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {skillList.map((s) => (
              <span key={s} style={{ display: "flex", background: "rgba(124,58,237,0.25)", border: "1px solid #7c3aed", color: "#c4b5fd", borderRadius: 8, padding: "6px 16px", fontSize: 16, fontWeight: 600 }}>
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
