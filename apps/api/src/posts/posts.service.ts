import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { CacheKeyService } from '../common/cache/cache-key.service'; 

// 定义一个简单的接口 (Go struct)
export interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
}

@Injectable()
export class PostsService {
  // 注入PrismaService
  constructor(
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis, // 注入 Redis 实例
    private readonly cacheKeyService: CacheKeyService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = this.prisma.post.create({
        data: {
            title: createPostDto.title,
            content: createPostDto.content,
            published: true,
        },
    });

    const cacheKey = this.cacheKeyService.postsListKey;
    // 清理缓存
    await this.redis.del(cacheKey);

    return post;
  }

  async findAll() {
    const cacheKey = this.cacheKeyService.postsListKey;
    // 查缓存
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 查 DB
    const posts = await this.prisma.post.findMany({
       where: {published: true},
        include: {author: true},
        orderBy: {id: 'desc'},
    });

    // 回写缓存 (5分钟过期)
    await this.redis.set(cacheKey, JSON.stringify(posts), 'EX', 300);

    return posts;
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({
        where:{id},
    });
  }

  async delete(id: number) {
    return this.prisma.post.delete({
        where: {id},
    });
  }
}

