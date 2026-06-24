/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
  // Ensure trailing slashes don't cause issues
  trailingSlash: false,
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;