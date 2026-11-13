import { expect, test } from "vitest";
import en from "../../messages/en.json";
import pt from "../../messages/pt.json";

function flatten(value: unknown, prefix = ""): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return { [prefix]: value };
  return Object.entries(value).reduce<Record<string, unknown>>(
    (acc, [key, child]) => ({ ...acc, ...flatten(child, prefix ? `${prefix}.${key}` : key) }),
    {},
  );
}

test("pt and en carry the same keys", () => {
  expect(Object.keys(flatten(en)).sort()).toEqual(Object.keys(flatten(pt)).sort());
});

test("no message is empty", () => {
  for (const [key, value] of Object.entries({ ...flatten(pt), ...flatten(en) })) {
    expect(value, key).not.toBe("");
  }
});
