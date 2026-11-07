import { describe, expect, it, vi } from "vitest";
import { sendContact } from "@/lib/contact";

const valid = {
  name: "Ana",
  email: "ana@example.com",
  message: "Olá Kevin, vaga de estágio & café?",
  website: "",
};

describe("sendContact", () => {
  it("rejects an empty message", async () => {
    const r = await sendContact({ ...valid, message: "" }, { apiKey: "k", send: vi.fn() });
    expect(r).toMatchObject({ ok: false, reason: "invalid" });
  });
  it("rejects a filled honeypot", async () => {
    const send = vi.fn();
    const r = await sendContact({ ...valid, website: "spam" }, { apiKey: "k", send });
    expect(r).toMatchObject({ ok: false, reason: "invalid" });
    expect(send).not.toHaveBeenCalled();
  });
  it("falls back to mailto without a key", async () => {
    const r = await sendContact(valid, {});
    expect(r).toMatchObject({ ok: false, reason: "unconfigured" });
    if (r.ok) throw new Error("unreachable");
    expect(r.mailto.startsWith("mailto:")).toBe(true);
    expect(r.mailto).toContain(encodeURIComponent(valid.message));
  });
  it("reports a failed send", async () => {
    const send = vi.fn().mockRejectedValue(new Error("boom"));
    expect(await sendContact(valid, { apiKey: "k", send })).toMatchObject({
      ok: false,
      reason: "failed",
    });
  });
  it("reports a provider error as failed", async () => {
    const send = vi.fn().mockResolvedValue({ error: { message: "bad" } });
    expect(await sendContact(valid, { apiKey: "k", send })).toMatchObject({ reason: "failed" });
  });
  it("sends", async () => {
    const send = vi.fn().mockResolvedValue({});
    expect(await sendContact(valid, { apiKey: "k", to: "me@x.dev", send })).toEqual({ ok: true });
    expect(send.mock.calls[0]![0]).toMatchObject({ to: "me@x.dev", replyTo: valid.email });
  });
});
