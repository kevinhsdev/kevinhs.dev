import { expect, test } from "vitest";
import { profile } from "@/content";
import { cvHref } from "@/lib/ctas";

test("pt gets the PT CV", () => {
  expect(cvHref("pt")).toEqual({ href: profile.cv.pt, fallback: false });
});

test("en falls back to the PT CV until the EN one exists", () => {
  expect(cvHref("en")).toEqual(
    profile.cv.en
      ? { href: profile.cv.en, fallback: false }
      : { href: profile.cv.pt, fallback: true },
  );
});
