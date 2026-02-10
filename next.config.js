/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/v1/:path*',
          destination: 'https://api.aytix.uz/api/v1/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'https://api.aytix.uz/uploads/:path*',
        },
      ],
      fallback: [],
    }
  },
}

module.exports = nextConfig
