import { getLocale } from "next-intl/server";
import { pick, profile } from "@/content";
import { cn } from "@/lib/utils";

export async function StatusBadge({ className }: { className?: string }) {
  const locale = await getLocale();
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-positive" />
      </span>
      {pick(profile.status, locale)}
    </p>
  );
}
