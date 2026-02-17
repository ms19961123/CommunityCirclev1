/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANT:
  // Do NOT use output: "export" on Vercel for an app that uses auth, headers(), API routes, Prisma, etc.
  // Do NOT set experimental.serverActions (it's on by default now).
};

export default nextConfig;
