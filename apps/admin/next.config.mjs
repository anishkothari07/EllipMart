/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
      },
    ],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs', '@corecart/database'],
  transpilePackages: ['@corecart/commerce', '@corecart/shared', '@corecart/ui', '@corecart/types'],
  
}

export default nextConfig
