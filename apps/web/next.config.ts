import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 允许 Next.js 编译 workspace 包
  transpilePackages: ['@forum/shared-types'],
  // 强制开启 Webpack 轮询
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,             // 每秒检查一次变动
      aggregateTimeout: 300,  // 防抖延迟
    }
    return config
  },
};

export default nextConfig;
