import { PostCard } from "../components/PostCard";
import Link from "next/link"; // Next.js 专用的跳转组件
import { getBaseUrl } from "@/utils/env";

// 1. 定义数据获取函数 (直接写 async)
// 这段代码只在服务端运行，浏览器看不见
async function getPosts() {
  // cache: 'no-store' 相当于告诉 Next.js 不要缓存数据，每次刷新都重新查
  // 否则你发了新帖，首页可能还不更新
  const res = await fetch(`${getBaseUrl()}/posts`, { cache: "no-store" });
  
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  const result = await res.json(); // result 现在的结构是 { code: 0, message: "OK", data: [...] }
  if (result.code !== 0) {
    throw new Error(result.message);
  }
  const data = result.data;
  
  return data;
}

// 2. 页面组件 (Async Function)
export default async function Home() {
  // 🔥 直接 Await！不需要 useEffect！
  // 在 Go 里这就像: data := svc.GetPosts(); render(template, data)
  const posts = await getPosts();

  return (
    <div className="container mx-auto p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">最新帖子</h1>
        <Link 
          href="/posts/new" 
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          发布新帖
        </Link>
      </div>

      <div className="grid gap-4">
        {/* 注意：这里的 posts 已经是数据了，不是 Promise */}
        {posts.map((post: any) => (
          // Link 组件包裹卡片，点击跳转详情
          <Link href={`/posts/${post.id}`} key={post.id}>
             <PostCard post={post} />
          </Link>
        ))}
      </div>
    </div>
  );
}