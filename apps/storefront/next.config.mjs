/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  devIndicators: false,
  typescript: { ignoreBuildErrors: true },
  allowedDevOrigins: [
    '192.168.68.59',
    '192.168.68.59:3001',
    '192.168.68.56',
    '192.168.68.56:3001',
    '192.168.68.57',
    '192.168.68.57:3001',
    'localhost:3001',
    '*.loca.lt',
    '*.trycloudflare.com',
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      }
    ],
  },
  serverExternalPackages: ['sharp', '@prisma/client', 'bcryptjs', '@corecart/database'],
  transpilePackages: ['@corecart/commerce', '@corecart/shared', '@corecart/ui', '@corecart/types'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      },
    ]
  },
}

export default nextConfig
