/** Asks <Providers> to mount the (lazy) Toaster right now. */
export const TOASTER_EVENT = "toaster:mount";

type Kind = "default" | "success" | "error";

/**
 * Shows a toast without putting sonner in the first load: the library and the
 * Toaster are fetched on demand (they are usually already there after idle).
 */
export async function notify(
  message: string,
  { kind = "default", description }: { kind?: Kind; description?: string } = {},
) {
  window.dispatchEvent(new Event(TOASTER_EVENT));
  const { toast } = await import("sonner");
  await waitForToaster();
  const options = description ? { description } : undefined;
  if (kind === "default") toast(message, options);
  else toast[kind](message, options);
}

/** Toasts sent before the Toaster mounts would be lost; wait up to ~1s for it. */
async function waitForToaster() {
  for (let frame = 0; frame < 60; frame++) {
    if (document.querySelector("[data-sonner-toaster]")) return;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}
