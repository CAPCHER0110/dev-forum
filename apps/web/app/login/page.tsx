"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link"; // Next.js 专用的跳转组件
import { getBaseUrl } from "@/utils/env";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认刷新提交

    try {
      // 1. 调用后端 API
      const res = await fetch(`${getBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("登录失败，请检查账号密码");
        return;
      }

      const result = await res.json(); // result 现在的结构是 { code: 0, message: "OK", data: [...] }

      if (result.code !== 0) {
        throw new Error(result.message);
      }

      const data = result.data;
      
      // 2. 拿到 Token，存入 Cookie
      // const token = data.access_token;
      // console.log("Token:", token);
      Cookies.set("token", data.access_token, { expires: 1 }); // 1天过期

      alert("登录成功！");
      router.push("/"); // 跳回首页
      router.refresh(); // 刷新页面状态

    } catch (err) {
      console.error(err);
      alert("网络错误");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">登录 Dev Forum</h1>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold">Email</label>
          <input
            className="w-full border p-2 rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold">密码</label>
          <input
            className="w-full border p-2 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          登录
        </button>

        {/* 🔥 新增：跳转去注册 */}
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">还没有账号？</span>
          <Link href="/register" className="text-green-600 hover:underline ml-1">
            注册一个
          </Link>
        </div>
      </form>
    </div>
  );
}