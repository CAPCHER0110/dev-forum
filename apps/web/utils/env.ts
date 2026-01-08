export function getBaseUrl() {
  // 1. 浏览器环境：只能用公网地址或 localhost
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  }

  // 2. 服务端环境 (SSR)：
  
  // 情况 A: 如果配置了 INTERNAL_API_URL (通常用于 Docker 内部通信)，优先使用
  // 但是！在本地开发时，不要设置这个变量，或者把它设为 http://localhost:4000
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }

  // 情况 B: 默认回退到 服务端 (Docker 内部)：用服务名 api
  return "http://api:4000";
}