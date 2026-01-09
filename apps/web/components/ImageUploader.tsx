'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';

interface ImageUploaderProps {
  onUploadSuccess: (markdown: string) => void; // 上传成功后的回调
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 简单校验
    if (!file.type.startsWith('image/')) {
      alert('只能上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 获取 Token (假设你存在 Cookie 里)
      const token = Cookies.get('token'); 
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'; // 也可以用 window.location.origin

      // 调用后端上传接口
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // 必须带上 Token
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      
      // 假设后端返回结构是 { code: 200, data: { url: "/uploads/xxx.jpg" } } 
      // 或者直接是 { url: "/uploads/xxx.jpg" }，请根据你实际后端调整
      // 这里兼容你之前 Go/NestJS 的 Response 结构
      const imageUrl = data.data?.url || data.url; 

      if (imageUrl) {
        // 生成 Markdown 格式
        const markdown = `![${file.name}](${imageUrl})`;
        onUploadSuccess(markdown);
      } else {
        alert('上传成功但未返回 URL');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      // 清空 input，允许重复上传同一张图
      e.target.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label 
        htmlFor="image-upload" 
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            上传中...
          </>
        ) : (
          <>
            📷 插入图片
          </>
        )}
        <input 
          id="image-upload" 
          type="file" 
          accept="image/*" 
          className="sr-only" 
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      <span className="ml-2 text-xs text-gray-500">支持 jpg, png, gif (Max 5MB)</span>
    </div>
  );
}