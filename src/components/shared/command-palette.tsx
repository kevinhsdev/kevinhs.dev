"use client";

import { Command } from "cmdk";
import { ArrowRight, Copy, Download, Languages, Monitor, Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import {
  OPEN_EVENT,
  markPaletteReady,
  scrollToAnchor,
  startBufferingKeys,
  takeBufferedKeys,
  useRegisteredNavigation,
} from "@/components/shared/command-menu";
import { copyEmail } from "@/components/shared/ctas";
import { useLocaleSwitch } from "@/components/shared/locale-toggle";
import { profile } from "@/content/profile";
import { useRouter } from "@/i18n/navigation";
import { trackCta } from "@/lib/analytics";

/** The ⌘K palette UI. Loaded lazily by <CommandMenu> so cmdk stays off the first load. */
export function CommandPalette() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const localeSwitch = useLocaleSwitch();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigation = useRegisteredNavigation();

  function navigate(href: string) {
    if (!scrollToAnchor(href)) router.push(href);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearch("");
        setOpen((value) => {
          if (!value) startBufferingKeys();
          return !value;
        });
      }
    }
    const onOpen = () => {
      startBufferingKeys();
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    markPaletteReady(true);
    return () => {
      markPaletteReady(false);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  function changeOpen(next: boolean) {
    setSearch("");
    setOpen(next);
  }

  function run(action: () => void) {
    changeOpen(false);
    action();
  }

  const cvHref = (locale === "en" && profile.cv.en) || profile.cv.pt;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={changeOpen}
      label={t("command.open")}
      overlayClassName="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
      contentClassName="fixed top-[12dvh] left-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl shadow-2xl"
      className="rounded-xl border border-border bg-surface text-foreground"
    >
      <Command.Input
        value={search}
        onValueChange={setSearch}
        // Keys typed between ⌘K and this focus were buffered; put them in the field.
        onFocus={() => {
          const keys = takeBufferedKeys();
          if (keys) setSearch((value) => value + keys);
        }}
        placeholder={t("command.placeholder")}
        className="w-full border-b border-border bg-transparent px-4 py-4 text-base outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[min(60dvh,420px)] overflow-y-auto overscroll-contain p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
          {t("command.empty")}
        </Command.Empty>

        {navigation.length > 0 && (
          <Group heading={t("command.groups.navigate")}>
            {navigation.map((item) => (
              <Item
                key={item.href}
                icon={<ArrowRight />}
                onSelect={() => run(() => navigate(item.href))}
              >
                {item.label}
              </Item>
            ))}
          </Group>
        )}

        <Group heading={t("command.groups.actions")}>
          <Item
            icon={<Download />}
            onSelect={() =>
              run(() => {
                trackCta("cv_download", { locale, source: "command-menu" });
                window.open(cvHref, "_blank", "noopener");
              })
            }
          >
            {t("cta.downloadCv")}
          </Item>
          <Item
            icon={<Copy />}
            keywords={["email", "e-mail", profile.email]}
            onSelect={() =>
              run(
                () =>
                  void copyEmail(
                    {
                      copied: t("cta.emailCopied"),
                      failed: t("cta.emailCopyFailed", { email: profile.email }),
                    },
                    { locale, source: "command-menu" },
                  ),
              )
            }
          >
            {t("cta.copyEmail")}
          </Item>
        </Group>

        <Group heading={t("command.groups.links")}>
          <Item
            icon={<LinkedInIcon />}
            onSelect={() =>
              run(() => {
                trackCta("linkedin_click", { locale, source: "command-menu" });
                window.open(profile.links.linkedin, "_blank", "noopener");
              })
            }
          >
            {t("cta.linkedin")}
          </Item>
          <Item
            icon={<GitHubIcon />}
            onSelect={() =>
              run(() => {
                trackCta("github_click", { locale, source: "command-menu" });
                window.open(profile.links.github, "_blank", "noopener");
              })
            }
          >
            {t("cta.github")}
          </Item>
        </Group>

        <Group heading={t("command.groups.preferences")}>
          <Item icon={<Sun />} onSelect={() => run(() => setTheme("light"))}>
            {`${t("theme.label")}: ${t("theme.light")}`}
          </Item>
          <Item icon={<Moon />} onSelect={() => run(() => setTheme("dark"))}>
            {`${t("theme.label")}: ${t("theme.dark")}`}
          </Item>
          <Item icon={<Monitor />} onSelect={() => run(() => setTheme("system"))}>
            {`${t("theme.label")}: ${t("theme.system")}`}
          </Item>
          <Item
            icon={<Languages />}
            keywords={["language", "idioma", "english", "português"]}
            onSelect={() => run(() => window.location.assign(localeSwitch.href))}
          >
            {t("locale.switchTo")}
          </Item>
        </Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Group({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="mb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  icon,
  children,
  onSelect,
  keywords,
}: {
  icon: ReactNode;
  children: string;
  onSelect: () => void;
  keywords?: string[];
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm data-[selected=true]:bg-border/70 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted"
    >
      {icon}
      {children}
    </Command.Item>
  );
}
