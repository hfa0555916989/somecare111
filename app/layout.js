import "./globals.css";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const c = await getContent();
  return {
    title: c.seo.title,
    description: c.seo.description,
    icons: { icon: c.brand.logo || "/icon.png" },
  };
}

export const viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }) {
  const c = await getContent();
  const t = c.theme;
  const style = {
    "--bg": t.bg,
    "--surface": t.surface,
    "--text": t.text,
    "--primary": t.primary,
    "--price": t.price,
  };
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Reem+Kufi:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={style}>{children}</body>
    </html>
  );
}
