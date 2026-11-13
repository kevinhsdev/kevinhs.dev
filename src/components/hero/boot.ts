/**
 * How the home opens: "monta" hides the hero layers so the agents can build them;
 * "pronto" (?pronto or reduced motion) opens it already built; null on other routes.
 * Self-contained on purpose: BOOT_SCRIPT inlines its source.
 */
export function bootMode(
  pathname: string,
  search: string,
  reduced: boolean,
): "monta" | "pronto" | null {
  if (!/^\/(pt|en)?\/?$/.test(pathname)) return null;
  return /[?&]pronto\b/.test(search) || reduced ? "pronto" : "monta";
}

/**
 * Runs before the home paints (next/script beforeInteractive). If the swarm hasn't
 * started in 5 s, the page shows up built (the Kairo bundle's safeguard).
 */
export const BOOT_SCRIPT = `(function(m){var r=document.documentElement;m=m(location.pathname,location.search,matchMedia('(prefers-reduced-motion: reduce)').matches);if(!m)return;r.classList.add('js',m);if(matchMedia('(hover: none)').matches)r.classList.add('toque');if(m==='monta')setTimeout(function(){if(!window.__enxame){r.classList.remove('monta');r.classList.add('pronto');}},5000);})(${bootMode.toString()});`;
