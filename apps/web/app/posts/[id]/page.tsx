// src/app/posts/[id]/page.tsx
import { getBaseUrl } from "@/utils/env";

async function getPost(id: string) {
  const res = await fetch(`${getBaseUrl()}/posts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;

  const result = await res.json(); // result 现在的结构是 { code: 0, message: "OK", data: [...] }
  if (result.code !== 0) {
    throw new Error(result.message);
  }
  const data = result.data;

  return data;
}

interface Props {
  params: Promise<{ id: string }>;
}

// Next.js 会自动把 URL 参数传给 params
export default async function PostDetailPage({ params }: {params: Promise<{ id: string }>;}) {
  // 🔥 修改点 2: 必须 await params
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return <div className="p-10">帖子不存在</div>;
  }

  return (
    <div className="container mx-auto p-10 max-w-2xl">
      <div className="mb-4 text-gray-500 text-sm">
        发布时间: {new Date(post.createdAt).toLocaleString()}
      </div>
      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
      {/* whitespace-pre-wrap 保留换行符 */}
      <div className="text-lg leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>
    </div>
  );
}