/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    proxyTimeout: 60_000 // limit proxying to 30 seconds 
  },
  rewrites: async () => {
    return [
      {
        source: "/api/python/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/python/:path*"
            : "/api/python/:path*",
      },
    ];
  }
}

module.exports = nextConfig
