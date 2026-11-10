import { notFound } from "next/navigation";

/** Any path under a locale that no page matches lands on the localized not-found page. */
export default function CatchAll() {
  notFound();
}
