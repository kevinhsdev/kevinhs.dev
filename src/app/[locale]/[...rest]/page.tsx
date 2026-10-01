import { notFound } from "next/navigation";

// Any unknown path under /pt or /en renders the localized not-found page.
export default function CatchAll() {
  notFound();
}
