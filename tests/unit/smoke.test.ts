import { existsSync } from "node:fs";
import { expect, test } from "vitest";

test("toolchain runs and the prompt sources travel with the repo", () => {
  expect(1 + 1).toBe(2);
  expect(existsSync("docs/prompts/new-prompts.txt")).toBe(true);
});
