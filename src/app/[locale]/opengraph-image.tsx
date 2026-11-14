import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { KEVIN_MARK_PATH } from "@/components/shell/logo";
import { pick, profile } from "@/content";
import { routing } from "@/i18n/routing";

/*
 * The card LinkedIn, WhatsApp and others show for a shared link (every page under [locale]
 * inherits it). Without it they grab some large image off the page. Satori can't read CSS
 * variables, so the dark palette from src/styles/tokens.css is repeated here.
 */
const palette = {
  background: "#070d1f",
  foreground: "#eef2fb",
  muted: "#8e9ab5",
  border: "#1c2847",
  accent: "#4d8dff",
};

export const alt = `${profile.fullName} · Software Engineering`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const requested = (await params).locale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const anton = await readFile(join(process.cwd(), "src/assets/fonts/Anton-Regular.ttf"));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: `radial-gradient(circle at 85% 0%, #1d4dff55, transparent 55%), ${palette.background}`,
        color: palette.foreground,
        fontSize: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: palette.muted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg viewBox="0 0 118 107" width={38} height={34} fill={palette.accent}>
            <path d={KEVIN_MARK_PATH} />
          </svg>
          <span>© Code by Kevin</span>
        </div>
        <span style={{ color: palette.accent }}>{pick(profile.status, locale)}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Anton",
            fontSize: 136,
            lineHeight: 1,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 960,
            fontSize: 36,
            lineHeight: 1.3,
            color: palette.muted,
          }}
        >
          {pick(profile.headline, locale)}
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
        <span>{profile.stackLine}</span>
        <span style={{ color: palette.foreground }}>{pick(profile.location, locale)}</span>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] },
  );
}
