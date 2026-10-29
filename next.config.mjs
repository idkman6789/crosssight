/** @type {import('next').NextConfig} */
const nextConfig = {
  // A stray package-lock.json in the user's home folder confuses root detection.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
