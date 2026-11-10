"use client";

import { Copy, Download, SendHorizontal } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  GitHubButton,
  InstagramButton,
  LinkedInButton,
  useCopyEmail,
  useCvLabel,
} from "@/components/shell/ctas";
import { MetalButton } from "@/components/ui/mercurio";
import { profile } from "@/content/profile";
import { contactAction } from "@/lib/contact-action";
import { contactSchema } from "@/lib/contact-schema";
import { prefersReduced } from "@/motion/reduced";
import "./contact.css";

const PRESETS = ["opportunity", "project", "general"] as const;

/** The form's state and its send, behind the chat. */
function useContactForm() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [pending, start] = useTransition();

  /** Check, then send; a refused message stays in the box. */
  const submit = () => {
    const text = message.trim();
    if (!contactSchema.safeParse({ name, email: from, message: text, website }).success)
      return void toast.error(t("invalid"));
    start(async () => {
      const r = await contactAction({ name, email: from, message: text, website });
      if (r.ok) {
        setLog((l) => [...l, text]);
        setMessage("");
        return;
      }
      toast.error(t(r.reason));
      if (r.reason !== "invalid") window.location.href = r.mailto;
    });
  };

  return {
    t,
    name,
    setName,
    from,
    setFrom,
    message,
    setMessage,
    website,
    setWebsite,
    log,
    pending,
    submit,
  };
}
type Form = ReturnType<typeof useContactForm>;

/**
 * The conversation, laid out like a messaging app: a header, the log (my messages arrive one by
 * one with "typing…" in between, then a card asking who you are), quick replies, the composer.
 * A sent message shows on the right with ✓✓ and gets an answer.
 */
function ChatApp({
  f,
  bubbles,
  className = "",
}: {
  f: Form;
  bubbles: React.ReactNode[];
  className?: string;
}) {
  const email = useCopyEmail();
  const cv = useCvLabel();
  const root = useRef<HTMLDivElement>(null);
  const logEl = useRef<HTMLDivElement>(null);
  const total = bubbles.length + 1; // + the "who are you" card
  const [shown, setShown] = useState(0);

  // start the conversation once the chat is on screen
  useEffect(() => {
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        if (prefersReduced()) return setShown(total);
        for (let i = 1; i <= total; i++)
          timers.push(window.setTimeout(() => setShown(i), 500 + (i - 1) * 1100));
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(root.current!);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [total]);

  // keep the newest message in view
  useEffect(() => {
    const el = logEl.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, f.log.length]);

  const lastIn = Math.min(shown, bubbles.length) - 1;
  return (
    <div ref={root} className={`ct-app ${className}`}>
      <header className="ct-app-head">
        {profile.photo && (
          <Image src={profile.photo.src} alt="" width={80} height={80} className="ct-avatar" />
        )}
        <div className="min-w-0">
          <b className="block truncate">{profile.name}</b>
          <span className="ct-online">{f.t("chat.status")}</span>
        </div>
        <div className="ct-app-actions">
          <button
            type="button"
            onClick={() => void email.copy()}
            aria-label={email.label}
            title={email.label}
          >
            <Copy aria-hidden className="size-[18px]" />
          </button>
          <a href={cv.href} download aria-label={cv.label} title={cv.label}>
            <Download aria-hidden className="size-[18px]" />
          </a>
        </div>
      </header>

      <div ref={logEl} className="ct-app-log" role="log" aria-live="polite">
        <p className="ct-day">{f.t("chat.today")}</p>
        {bubbles.slice(0, shown).map((b, i) => (
          <div
            key={i}
            className="ct-msg ct-in"
            data-tail={(i === lastIn && shown <= bubbles.length) || undefined}
          >
            {b}
          </div>
        ))}
        {shown === total && (
          <div className="ct-msg ct-in ct-card" data-tail>
            <p>{f.t("chat.idTitle")}</p>
            <label className="sr-only" htmlFor="ct-name">
              {f.t("name")}
            </label>
            <input
              id="ct-name"
              placeholder={f.t("name")}
              autoComplete="name"
              maxLength={100}
              value={f.name}
              onChange={(e) => f.setName(e.target.value)}
            />
            <label className="sr-only" htmlFor="ct-email">
              {f.t("email")}
            </label>
            <input
              id="ct-email"
              type="email"
              placeholder={f.t("email")}
              autoComplete="email"
              value={f.from}
              onChange={(e) => f.setFrom(e.target.value)}
            />
          </div>
        )}
        {shown > 0 && shown < total && (
          <div className="ct-typing" role="status" aria-label={f.t("chat.typing")}>
            <i />
            <i />
            <i />
          </div>
        )}
        {f.log.map((m, i) => (
          <Fragment key={i}>
            <div className="ct-msg ct-out" data-tail>
              {m}
              <small>{f.t("chat.now")} ✓✓</small>
            </div>
            <div className="ct-msg ct-in" data-tail>
              {f.t("sent")}
            </div>
          </Fragment>
        ))}
      </div>

      <div className="ct-quick" role="group" aria-label={f.t("presetsTitle")}>
        {PRESETS.map((k) => {
          const text = f.t(`presets.${k}.text`);
          return (
            <button
              key={k}
              type="button"
              aria-pressed={f.message === text}
              onClick={() => f.setMessage(text)}
            >
              {f.t(`presets.${k}.label`)}
            </button>
          );
        })}
      </div>

      <form
        className="ct-compose"
        aria-busy={f.pending}
        onSubmit={(e) => {
          e.preventDefault();
          f.submit();
        }}
      >
        {/* honeypot: hidden from people, bots fill it */}
        <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            {f.t("honeypot")}
            <input
              tabIndex={-1}
              autoComplete="off"
              value={f.website}
              onChange={(e) => f.setWebsite(e.target.value)}
            />
          </label>
        </div>
        <label className="sr-only" htmlFor="ct-message">
          {f.t("message")}
        </label>
        <textarea
          id="ct-message"
          rows={1}
          placeholder={f.t("placeholder")}
          value={f.message}
          onChange={(e) => f.setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button type="submit" aria-label={f.t("send")} disabled={f.pending || !f.message.trim()}>
          <SendHorizontal aria-hidden className="size-5" />
        </button>
      </form>
    </div>
  );
}

/** Contact (always dark, fading into the footer's black): the e-mail up front, the chat beside it. */
export function Contact() {
  const f = useContactForm();
  const email = useCopyEmail();
  return (
    <section id="contact" aria-labelledby="contact-title" className="contact dark">
      <div className="mx-auto grid min-h-svh max-w-7xl items-center gap-14 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <h2 id="contact-title" className="ct-title">
            {f.t("title")}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-[var(--stage-muted)]">{f.t("intro")}</p>
          <button type="button" onClick={() => void email.copy()} className="contact-email">
            {profile.email}
          </button>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MetalButton onClick={() => void email.copy()}>{email.label}</MetalButton>
            <LinkedInButton compact className="ct-social" />
            <InstagramButton compact className="ct-social" />
            <GitHubButton compact className="ct-social" />
          </div>
        </div>
        <ChatApp
          f={f}
          bubbles={[f.t("chat.hi"), f.t("chat.ask")]}
          className="ct-app-framed lg:col-span-6"
        />
      </div>
    </section>
  );
}
