import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex"
          }
        ]
      }
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.myqcloud.com" },
      { protocol: "https", hostname: "**.cos.**.myqcloud.com" },
      { protocol: "https", hostname: "susu-img-wx.cnhalo.com" },
      { protocol: "https", hostname: "**.cnhalo.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
