"use client";

import { Gamepad2, Lock, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore, type CSSProperties } from "react";
import {
  arcadeSnapshot,
  setArcade,
  subscribeArcade,
  subscribeUnlocked,
  unlockedSnapshot,
  visitorAchievements,
} from "@/components/shared/visitor-achievements-data";
import "@/styles/visitor-achievements.css";

/**
 * The visitor's trophy case, at the end of the page: how many of the site's
 * achievements they have and how many are left, with a hint for each locked
 * one. Updates live as toasts unlock; renders 0 on the server, then fills in.
 */
/** The platinum reward: the switch for the secret arcade theme. */
function PlatinumReward() {
  const t = useTranslations("visitorAchievements.reward");
  const arcade = useSyncExternalStore(subscribeArcade, arcadeSnapshot, () => false);
  return (
    <div className="vt-reward">
      <div>
        <h3>{t("title")}</h3>
        <p>{t("note")}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={arcade}
        className="vt-switch"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setArcade(!arcade, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        }}
      >
        <span className="vt-switch-icon">
          <Gamepad2 aria-hidden className="size-5" />
        </span>
        <span className="vt-switch-text">
          <b>{t("theme")}</b>
          <small>{arcade ? t("on") : t("off")}</small>
        </span>
        <span className="vt-toggle" aria-hidden>
          <i />
        </span>
      </button>
    </div>
  );
}

export function VisitorTrophies() {
  const t = useTranslations("visitorAchievements");
  const snapshot = useSyncExternalStore(subscribeUnlocked, unlockedSnapshot, () => "");
  const got = new Set(snapshot ? snapshot.split(",") : []);
  const total = visitorAchievements.length;
  const left = total - got.size;

  return (
    <section
      id="trophies"
      className="vt"
      aria-labelledby="vt-title"
      data-print="hide"
      style={{ "--p": got.size / total } as CSSProperties}
    >
      <div className="vt-head">
        <span className={left === 0 ? "vt-cup is-done" : "vt-cup"}>
          <Trophy aria-hidden className="size-5" />
        </span>
        <div className="vt-intro">
          <h2 id="vt-title">{t("case.title")}</h2>
          <p>{left === 0 ? t("case.done") : t("case.note")}</p>
        </div>
        <p className="vt-count">
          <span>
            <b>{got.size}</b>/{total}
          </span>
          <small>{left === 0 ? t("case.complete") : t("case.left", { left })}</small>
        </p>
      </div>
      <span className="vt-bar" aria-hidden>
        <i />
      </span>
      <ul className="vt-list">
        {visitorAchievements.map(({ id, icon: Icon }) => {
          const on = got.has(id);
          return (
            <li key={id} className={on ? "is-on" : undefined} tabIndex={0}>
              <span className="vt-badge">
                {on ? (
                  <Icon aria-hidden className="size-5" />
                ) : (
                  <Lock aria-hidden className="size-4" />
                )}
              </span>
              <span className="vt-name">{on ? t(`items.${id}.title`) : "???"}</span>
              <span className="vt-tip" role="tooltip">
                <b>{on ? t(`items.${id}.title`) : t("case.locked")}</b>
                {on ? t(`items.${id}.desc`) : t(`items.${id}.hint`)}
              </span>
            </li>
          );
        })}
      </ul>
      {left === 0 && <PlatinumReward />}
    </section>
  );
}
