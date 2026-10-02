/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // تحويل الدومين القديم somecare.shop إلى الرابط المعتمد (301).
  // لا يعمل إلا بعد إضافة REDIRECT_OLD_DOMAIN=1 في Vercel، وذلك بعد التأكد أن الدومين الجديد يفتح فعلاً.
  async redirects() {
    if (process.env.REDIRECT_OLD_DOMAIN !== "1") return [];
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
