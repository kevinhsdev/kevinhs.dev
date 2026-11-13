// @vitest-environment jsdom
import gsap from "gsap";
import { expect, test } from "vitest";
import { Title, switcher } from "@/motion/title";

const settle = () => gsap.globalTimeline.getChildren().forEach((t) => t.progress(1));

test("an interrupted show settles hidden, never half-way", () => {
  const el = document.createElement("div");
  const title = new Title(el);
  title.show();
  title.hide();
  settle();
  expect(title.visible).toBe(false);
  expect(el.style.opacity).toBe("0");
});

test("switcher shows only the active title", () => {
  const els = [document.createElement("div"), document.createElement("div")];
  const titles = els.map((el) => new Title(el));
  const set = switcher(titles);
  set(1);
  settle();
  expect(titles.map((t) => t.visible)).toEqual([false, true]);
  set(null);
  settle();
  expect(titles.map((t) => t.visible)).toEqual([false, false]);
});
