import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/*
 * Satori can't read CSS variables, so the dark palette from src/styles/tokens.css is repeated
 * here. Keep both in sync.
 */
const palette = {
  background: "#070d1f",
  foreground: "#eef2fb",
  muted: "#8e9ab5",
  border: "#1c2847",
  accent: "#4d8dff",
};

const anton = readFile(join(process.cwd(), "src/assets/fonts/Anton-Regular.ttf"));

type OgImageInput = {
  kicker: string;
  title: string;
  subtitle: string;
  footer: string;
};

/** The shared social card: kicker, a big Anton title, a subtitle and a footer line. */
export async function renderOgImage({ kicker, title, subtitle, footer }: OgImageInput) {
  const host = new URL(siteUrl).host;
  const titleSize = title.length > 18 ? 104 : 136;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: palette.background,
        color: palette.foreground,
        fontSize: 30,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", color: palette.muted }}>
        <span>© Code by Kevin</span>
        <span style={{ color: palette.accent }}>{kicker}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Anton",
            fontSize: titleSize,
            lineHeight: 1,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 940,
            fontSize: 36,
            lineHeight: 1.3,
            color: palette.muted,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 28,
          borderTop: `2px solid ${palette.border}`,
          fontSize: 26,
          color: palette.muted,
        }}
      >
        <span>{footer}</span>
        <span style={{ color: palette.foreground }}>{host}</span>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [{ name: "Anton", data: await anton, style: "normal", weight: 400 }],
    },
  );
}
