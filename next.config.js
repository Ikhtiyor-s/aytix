/** @type {import('next').NextConfig} */
const API_PROXY = process.env.API_PROXY_URL || 'http://host.docker.internal:10018'

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
          destination: `${API_PROXY}/api/v1/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${API_PROXY}/uploads/:path*`,
        },
      ],
      fallback: [],
    }
  },
}

module.exports = nextConfig
