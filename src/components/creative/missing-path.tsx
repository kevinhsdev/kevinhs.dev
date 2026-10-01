"use client";

import { usePathname } from "next/navigation";

/** The 404 joke: the address the visitor typed, as git would complain about it. */
export function MissingPath() {
  const pathname = usePathname();
  return (
    <code className="block rounded-2xl border border-border bg-surface px-5 py-4 font-mono text-sm leading-relaxed break-all whitespace-pre-wrap text-muted">
      <span className="text-accent">$</span> git checkout {pathname}
      {"\n"}
      <span className="text-danger">error:</span> pathspec &apos;{pathname}&apos; did not match any
      file(s) known to git
    </code>
  );
}
