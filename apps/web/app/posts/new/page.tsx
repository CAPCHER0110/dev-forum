"use client"; // 🔥 必须加，因为我们要处理 onChange 和 onSubmit

import { useState } from "react";
import { useRouter } from "next/navigation"; // 注意不是 next/router
import Cookies from "js-cookie";
import { getBaseUrl } from "@/utils/env";

export default function CreatePostPage() {
  const router = useRouter(); // 用于页面跳转
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    const token = Cookies.get("token"); // 从 Cookie 取 Token
    e.preventDefault(); // 阻止表单默认提交刷新页面
    setLoading(true);

    try {
      const res = await fetch(`${getBaseUrl()}/posts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 关键：带上身份证！
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        router.push("/"); // 跳转回首页
        router.refresh(); // 🔥 强制刷新当前路由的数据 (因为 Next.js 有客户端缓存)
      } else {
        alert("发布失败");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-10 max-w-md">
      <h1 className="text-2xl font-bold mb-6">写文章</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="请输入标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">内容</label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="写点什么..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "发布中..." : "发布"}
        </button>
      </form>
    </div>
  );
}