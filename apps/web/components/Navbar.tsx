"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    router.refresh();
    // router.push("/login"); 
  };

  return (
    <nav className="bg-white shadow-sm p-4 mb-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* 左侧：Logo */}
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
          Dev Forum
        </Link>

        {/* 右侧：功能区 */}
        <div className="flex gap-4 items-center">
          
          {/* 🔥 新增：会员入口 (放在这里所有人都能看见) */}
          <Link 
            href="/pricing" 
            className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
          >
            <span>💎</span> 会员
          </Link>

          {isLoggedIn ? (
            <>
              <span className="text-gray-600 text-sm">欢迎回来</span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                退出登录
              </button>
              <Link 
                href="/posts/new" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                发帖
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900 transition-colors"
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