const BASE = process.env.SITE_URL || "https://www.somecare.shop";

export default function sitemap() {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
