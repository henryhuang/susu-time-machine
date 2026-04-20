import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
