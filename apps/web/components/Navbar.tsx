"use client"; // 🔥 必须是客户端组件，因为要操作 Cookie 和路由

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // 1. 组件加载时，检查 Cookie 里有没有 Token
  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token); // !!token 会把 string 转为 boolean
  }, []);

  // 2. 退出登录逻辑
  const handleLogout = () => {
    Cookies.remove("token"); // 删掉 Token
    setIsLoggedIn(false);    // 更新状态
    router.refresh();        // 刷新页面数据
    // router.push("/login"); // 可选：退出后跳回登录页
  };

  return (
    <nav className="bg-white shadow-sm p-4 mb-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* 左侧：Logo / 首页链接 */}
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
          Dev Forum
        </Link>

        {/* 右侧：根据登录状态显示不同按钮 */}
        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <>
              {/* 登录后显示的内容 */}
              <span className="text-gray-600 text-sm">欢迎回来</span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                退出登录
              </button>
              <Link 
                href="/posts/new" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                发帖
              </Link>
            </>
          ) : (
            <>
              {/* 未登录显示的内容 */}
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}