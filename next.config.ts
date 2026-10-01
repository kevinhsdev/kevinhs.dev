import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // The design versions were consolidated: the Creative one is now the home page.
  async redirects() {
    return [
      { source: "/:locale(pt|en)/creative", destination: "/:locale", permanent: true },
      {
        source: "/:locale(pt|en)/:version(modern|studio|editorial|terminal)",
        destination: "/:locale",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Plugins by name: Turbopack can't receive JS functions, only serializable options.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      [
        "rehype-pretty-code",
        // Highlighted at build time (zero client JS); both themes ship as CSS variables.
        {
          theme: { light: "github-light-high-contrast", dark: "github-dark-dimmed" },
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withNextIntl(withMDX(nextConfig));
