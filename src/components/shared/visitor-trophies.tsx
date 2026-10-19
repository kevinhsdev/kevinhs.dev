"use client";

import { Gamepad2, Lock, RotateCcw, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { TrophyIcon } from "@/components/shared/trophy-icons";
import { LegendReward } from "@/components/shared/legend-reward";
import { PlatinumTrophy } from "@/components/shared/trophy-icons-modern";
import {
  arcadeAchievements,
  arcadeSnapshot,
  mainAchievements,
  resetAchievements,
  setArcade,
  subscribeArcade,
  subscribeUnlocked,
  unlockedSnapshot,
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

/** What the platinum unlocks, shown greyed out while trophies are missing. */
function LockedReward({ left }: { left: number }) {
  const t = useTranslations("visitorAchievements.reward");
  return (
    <div className="vt-reward is-locked">
      <span className="vt-reward-cup">
        <PlatinumTrophy locked />
        <Lock aria-hidden className="size-4" />
      </span>
      <div>
        <h3>{t("lockedTitle")}</h3>
        <p>{t("lockedNote", { left })}</p>
      </div>
      <div className="vt-switch is-locked" aria-hidden>
        <span className="vt-switch-icon">
          <Gamepad2 className="size-5" />
        </span>
        <span className="vt-switch-text">
          <b>{t("theme")}</b>
          <small>{t("locked")}</small>
        </span>
        <Lock className="size-4" />
      </div>
    </div>
  );
}

/** Starts the hunt over, after a second click to confirm. */
function ResetButton() {
  const t = useTranslations("visitorAchievements.case");
  const [sure, setSure] = useState(false);
  return (
    <button
      type="button"
      className="vt-reset"
      onClick={() => {
        if (!sure) return setSure(true);
        resetAchievements();
        setSure(false);
      }}
      onBlur={() => setSure(false)}
    >
      <RotateCcw aria-hidden className="size-4" />
      {sure ? t("resetConfirm") : t("reset")}
    </button>
  );
}

export function VisitorTrophies() {
  const t = useTranslations("visitorAchievements");
  const snapshot = useSyncExternalStore(subscribeUnlocked, unlockedSnapshot, () => "");
  const got = new Set(snapshot ? snapshot.split(",") : []);
  const total = mainAchievements.length;
  const count = mainAchievements.filter((a) => got.has(a.id)).length;
  const left = total - count;
  const arcadeCount = arcadeAchievements.filter((a) => got.has(a.id)).length;

  const list = (items: typeof mainAchievements) => (
    <ul className="vt-list">
      {items.map(({ id }) => {
        const on = got.has(id);
        return (
          <li key={id} className={on ? "is-on" : undefined} tabIndex={0}>
            <span className="vt-badge">
              {on ? <TrophyIcon id={id} /> : <Lock aria-hidden className="size-4" />}
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
  );

  return (
    <section
      id="trophies"
      className="vt"
      aria-labelledby="vt-title"
      data-print="hide"
      style={{ "--p": count / total } as CSSProperties}
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
            <b>{count}</b>/{total}
          </span>
          <small>{left === 0 ? t("case.complete") : t("case.left", { left })}</small>
        </p>
      </div>
      <span className="vt-bar" aria-hidden>
        <i />
      </span>
      {list(mainAchievements)}
      {/* trophies that only exist inside the arcade theme */}
      <div data-arcade-only className="vt-arcade">
        <h3>
          {t("case.arcade")} <small>{`${arcadeCount}/${arcadeAchievements.length}`}</small>
        </h3>
        {list(arcadeAchievements)}
        <LegendReward />
      </div>
      {left === 0 ? <PlatinumReward /> : <LockedReward left={left} />}
      {got.size > 0 && <ResetButton />}
    </section>
  );
}
