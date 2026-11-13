import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // ProfitizeBuild components and the Kairo swarm engine, copied verbatim.
    "src/components/ui/**",
    "src/components/hero/engine/**",
  ]),
]);
