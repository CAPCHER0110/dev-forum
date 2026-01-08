"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 用于跳转回登录页
import { getBaseUrl } from "@/utils/env"; // 引入我们刚才写的工具函数

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. 调用注册接口 (注意：这里假设后端路由是 /auth/register)
      const res = await fetch(`${getBaseUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      //const data = await res.json();
      const result = await res.json(); // result 现在的结构是 { code: 0, message: "OK", data: [...] }

      if (result.code !== 0) {
        throw new Error(result.message);
      }

      const data = result.data;

      if (!res.ok) {
        // 后端可能会返回 { message: "邮箱已存在" } 之类的
        alert(data.message || "注册失败，请稍后重试");
        return;
      }

      // 2. 注册成功后的逻辑
      // 通常注册成功后有两种做法：
      // A. 直接帮用户登录 (写入 Cookie) 并跳首页
      // B. 跳回登录页让用户手动登录一次 (为了演示流程，我们选 B)
      alert("注册成功！请前往登录");
      router.push("/login"); 

    } catch (err) {
      console.error(err);
      alert("网络错误，无法连接服务器");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">注册新账号</h1>

        {/* 昵称输入框 */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold">昵称</label>
          <input
            className="w-full border p-2 rounded"
            type="text"
            placeholder="你是谁？"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* 邮箱输入框 */}
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

        {/* 密码输入框 */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold">密码</label>
          <input
            className="w-full border p-2 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6} // 前端简单的长度校验
          />
        </div>

        {/* 提交按钮 */}
        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors">
          立即注册
        </button>

        {/* 底部跳转链接 */}
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">已有账号？</span>
          <Link href="/login" className="text-blue-600 hover:underline ml-1">
            去登录
          </Link>
        </div>
      </form>
    </div>
  );
}