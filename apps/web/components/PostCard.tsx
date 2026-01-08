// "use client"; // 🔥 必须加这一行！告诉 Next.js 把这个组件打包发给浏览器

// import React from 'react';

// 引入类型
interface Post {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
}

// 定义 Props 接口 (父组件传给我的参数)
interface PostCardProps {
  post: Post;
  onClick?: () => void; // 可选的回调函数
}

// 组件函数
export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <div 
      onClick={onClick}
      className="border p-4 rounded shadow bg-white cursor-pointer hover:border-blue-500"
    >
    {/* 左侧：文章内容 */}
    <div>
      <h2 className="text-xl font-bold text-gray-800">{post.title}</h2>
      <p className="text-gray-600 mt-2 line-clamp-3">{post.content}</p>
    </div>
    {/* 右侧：[作业新增] 删除按钮 */}
    {/* <button 
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
      onClick={() => console.log('点击了删除 ID:', post.id)}
    >
      删除
    </button> */}

    </div>
  );
}