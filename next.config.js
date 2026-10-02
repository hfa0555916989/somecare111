/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // الدومين القديم يحوّل تحويلاً دائماً (301) إلى الرابط المعتمد، حتى تنتقل الفهرسة إليه
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?:www\\.)?somecare\\.shop" }],
        destination: "https://www.hassandev.sa/:path*",
        permanent: true,
      },
    ];
  },
};
