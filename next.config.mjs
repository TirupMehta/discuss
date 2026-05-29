/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.0.103", "192.168.0.103:3000"],
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://discuss-tirup-in.firebaseapp.com/__/auth/:path*',
      },
    ]
  },
}

export default nextConfig
