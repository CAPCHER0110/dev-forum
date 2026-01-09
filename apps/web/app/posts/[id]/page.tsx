// apps/web/app/posts/[id]/page.tsx
import { getBaseUrl } from "@/utils/env";
import ReactMarkdown from 'react-markdown'; // 👈 核心组件
import remarkGfm from 'remark-gfm';         // 👈 插件：表格、删除线等
import rehypeHighlight from 'rehype-highlight'; // 👈 插件：代码高亮

async function getPost(id: string) {
  const res = await fetch(`${getBaseUrl()}/posts/${id}`, { 
    cache: "no-store" // 确保获取最新内容
  });
  if (!res.ok) return null;

  const result = await res.json();
  if (result.code !== 0) {
    throw new Error(result.message);
  }
  return result.data;
}

// Next.js 会自动把 URL 参数传给 params
export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return <div className="p-10">帖子不存在</div>;
  }

  return (
    <div className="container mx-auto p-10 max-w-3xl">
      <div className="mb-6 text-gray-500 text-sm border-b pb-4">
        发布时间: {new Date(post.createdAt).toLocaleString()}
      </div>
      
      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

      {/* 🔥 核心修改区域 
         className="prose": 启用 tailwind-typography 的默认样式
         lg:prose-xl: 大屏下字体更大
         dark:prose-invert: 支持深色模式自动反色
         max-w-none: 取消最大宽度限制，占满容器
      */}
      <article className="prose lg:prose-xl dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeHighlight]}
          components={{
            // 自定义图片渲染（可选）：添加圆角和阴影
            img: ({node, ...props}) => (
              <img {...props} className="rounded-lg shadow-md my-4" style={{maxWidth: '100%'}} />
            )
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}