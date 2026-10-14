import { cn } from "@/lib/utils";

/**
 * A technology's full-color logo from public/skills/, swapping to its
 * <logo>-dark.svg variant on the dark theme when it has one. Decorative: the
 * technology's name is always written next to it.
 */
export function TechLogo({
  logo,
  dark,
  className,
}: {
  logo: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("inline-block shrink-0", className)}>
      {/* Small local SVGs; next/image adds nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/skills/${logo}.svg`}
        alt=""
        className={cn("size-full object-contain", dark && "dark:hidden")}
      />
      {dark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/skills/${logo}-dark.svg`}
          alt=""
          className="hidden size-full object-contain dark:block"
        />
      )}
    </span>
  );
}
