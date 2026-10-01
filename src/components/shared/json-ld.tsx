import { profile } from "@/content";
import { siteUrl } from "@/lib/site";

/** schema.org Person — helps search engines connect the site, GitHub and LinkedIn. */
export function PersonJsonLd({ locale }: { locale: "pt" | "en" }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    alternateName: profile.name,
    url: `${siteUrl}/${locale}`,
    email: `mailto:${profile.email}`,
    jobTitle: profile.role[locale],
    description: profile.headline[locale],
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.address.locality,
      addressRegion: profile.address.region,
      addressCountry: profile.address.country,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: profile.education.school,
      url: profile.education.schoolUrl,
    },
    knowsLanguage: profile.languages.map((language) => language.code),
    sameAs: [profile.links.github, profile.links.linkedin],
    ...(profile.photo ? { image: `${siteUrl}${profile.photo.src}` } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Escaping "<" prevents a "</script>" inside any string from closing the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
