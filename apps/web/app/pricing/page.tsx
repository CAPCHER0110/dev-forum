'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    const token = Cookies.get('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // const data = await res.json();
      const result = await res.json(); // result 现在的结构是 { code: 0, message: "OK", data: [...] }

      if (result.code !== 0) {
        throw new Error(result.message);
      }

      const data = result.data;

      if (data.url) {
        // 跳转到 Stripe 支付页面
        window.location.href = data.url;
      } else {
        alert('Create checkout failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-4 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">升级到 Pro 会员</h1>
      <p className="text-gray-600 mb-10">解锁所有高级功能，支持开发者社区。</p>

      <div className="border rounded-xl p-8 shadow-lg max-w-sm mx-auto bg-white">
        <h2 className="text-2xl font-bold">Pro Plan</h2>
        <div className="my-4 text-5xl font-extrabold text-indigo-600">$9.99<span className="text-lg text-gray-500 font-normal">/月</span></div>
        <ul className="text-left space-y-3 mb-8 text-gray-600">
          <li>✅ 无限上传图片</li>
          <li>✅ 专属 Pro 徽章</li>
          <li>✅ 优先技术支持</li>
        </ul>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? '正在跳转...' : '立即订阅'}
        </button>
      </div>
    </div>
  );
}