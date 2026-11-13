// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShaderStage, supportsWebgl } from "@/components/stage/shader-stage";

describe("ShaderStage", () => {
  afterEach(() => vi.restoreAllMocks());

  it("falls back to the token gradient without WebGL", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(supportsWebgl()).toBe(false);
    const { container } = render(<ShaderStage kind="fluxo">hi</ShaderStage>);
    const stage = container.firstElementChild as HTMLElement;
    await waitFor(() => expect(stage.dataset.fallback).toBe("true"));
    expect(stage.querySelector("canvas")).toBeNull();
    expect(stage.textContent).toBe("hi");
  });
});

describe("ShaderStage context loss", () => {
  it("falls back when the canvas loses its WebGL context", async () => {
    const { ShaderStage } = await import("@/components/stage/shader-stage");
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as never);
    const { container } = render(<ShaderStage kind="fluxo" />);
    const stage = container.firstElementChild as HTMLElement;
    const canvas = document.createElement("canvas");
    stage.append(canvas);
    canvas.dispatchEvent(new Event("webglcontextlost"));
    expect(stage.dataset.fallback).toBe("true");
    expect(canvas.style.display).toBe("none");
  });
});
