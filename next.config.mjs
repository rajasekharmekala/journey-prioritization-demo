/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Comment if TanStack table is used.
    reactCompiler: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
