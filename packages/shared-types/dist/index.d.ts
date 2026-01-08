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
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}
