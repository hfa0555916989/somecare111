// صور المتجر التجريبي ولوحة التحكم بعد قص شريط المتصفح، بنسخ WebP متجاوبة.
const widths = [480, 800, 1200];

function shot(stem, alt, altEn, caption, captionEn) {
  return {
    src: `/images/demo/${stem}-800.webp`,
    srcSet: widths.map((w) => `/images/demo/${stem}-${w}.webp ${w}w`).join(", "),
    alt,
    altEn,
    caption,
    captionEn,
    width: 1200,
    height: 702,
  };
}

export const DEMO_URL = "https://retail-store-template-production-fllgug.laravel.cloud/";
export const DEMO_EMAIL = "demo@store.sa";
export const DEMO_PASSWORD = "1111";

export const DEMO_SHOTS = [
  shot("home", "واجهة متجر إلكتروني تجريبي مع سلة ومنتجات", "Demo store home", "واجهة المتجر", "Store home"),
  shot("home-sections", "أقسام المتجر التجريبي بعد التمرير", "Store sections", "أقسام المتجر", "Store sections"),
  shot("products", "صفحة منتجات المتجر التجريبي", "Product listing", "قائمة المنتجات", "Products"),
  shot("product", "صفحة منتج في المتجر التجريبي", "Product page", "صفحة المنتج", "Product page"),
  shot("cart", "سلة الشراء في المتجر التجريبي", "Shopping cart", "سلة الشراء", "Cart"),
  shot("admin", "لوحة تحكم المتجر: الطلبات والمبيعات", "Admin dashboard", "لوحة التحكم", "Dashboard"),
  shot("admin-products", "إدارة المنتجات في لوحة التحكم", "Admin products", "إدارة المنتجات", "Manage products"),
  shot("admin-orders", "إدارة الطلبات في لوحة التحكم", "Admin orders", "إدارة الطلبات", "Orders"),
  shot("admin-analytics", "تقارير المبيعات في لوحة التحكم", "Admin analytics", "التقارير", "Analytics"),
  shot("admin-settings", "إعدادات المتجر في لوحة التحكم", "Admin settings", "الإعدادات", "Settings"),
];

export const DEMO_VIDEO = {
  mp4: "/video/store-demo.mp4",
  webm: "/video/store-demo.webm",
  poster: "/images/demo/home-800.webp",
  width: 960,
  height: 560,
};
