/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Farcaster CDN images for builder avatars
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.farcaster.xyz" },
      { protocol: "https", hostname: "**.warpcast.com" },
    ],
  },
};

export default nextConfig;
