'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
// 引入组件
import ImageUploader from '@/components/ImageUploader';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, published: true }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        alert('发布失败');
      }
    } catch (error) {
      console.error(error);
      alert('发布出错');
    } finally {
      setLoading(false);
    }
  };

  // 处理图片上传成功的回调
  const handleImageUploaded = (markdown: string) => {
    // 把图片 markdown 追加到内容后面
    setContent((prev) => prev + '\n' + markdown + '\n');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">发布新帖子</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">标题</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
          
          {/* 🔥 插入上传组件 */}
          <ImageUploader onUploadSuccess={handleImageUploaded} />

          <textarea
            required
            rows={8}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 Markdown 格式..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '发布中...' : '发布帖子'}
        </button>
      </form>
    </div>
  );
}