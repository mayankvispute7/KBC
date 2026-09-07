/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Kaun Banega College Pati — Next.js config
     Keep this lean; most config lives in tailwind.config.ts and tsconfig.json */
  experimental: {
    outputFileTracingRoot: __dirname,
  },
};

module.exports = nextConfig;
