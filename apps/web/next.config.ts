import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 允许 Next.js 编译 workspace 包
  transpilePackages: ['@forum/shared-types'],
  images: {
    // 允许加载来自 forum.local 的图片
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'forum.local',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost', // 开发环境可能直接用 localhost
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
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
