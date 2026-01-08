// 定义纯接口，不要带 NestJS 的装饰器（class-validator），因为前端不需要那些
export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Post {
  id: number;
  title: string;
  content?: string;
  published: boolean;
  author?: User;
  createdAt: string | Date;
}

// API 响应标准格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}