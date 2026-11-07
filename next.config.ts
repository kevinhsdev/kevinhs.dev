import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = { poweredByHeader: false, pageExtensions: ["ts", "tsx", "mdx"] };

// Plugins by name: Turbopack only takes serializable options.
const withMDX = createMDX({ options: { remarkPlugins: ["remark-gfm"] } });

export default createNextIntlPlugin("./src/i18n/request.ts")(withMDX(nextConfig));
