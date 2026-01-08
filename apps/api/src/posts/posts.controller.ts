import { Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseIntPipe, 
  Delete, 
  UseGuards, 
  Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Post as PostModel, ApiResponse } from '@forum/shared-types';

// @Controller('posts') -> 定义路由前缀 /posts
@Controller('posts')
export class PostsController {
  // 依赖注入：在构造函数里声明，Nest 自动把 Service 塞进来
  // 相当于 Go 的: func NewController(s *Service)
  constructor(private readonly postsService: PostsService) {}

  // GET /posts
  // @Get()
  // async findAll() {
  //   return this.postsService.findAll();
  // }

  @Get()
  async findAll(): Promise<PostModel[]> { // 使用共享接口约束返回值
    return this.postsService.findAll();
  }

  // GET /posts/:id
  @Get(':id')
  // @Param('id') 提取 URL 参数
  // ParseIntPipe 是 Nest 的“管道”，自动把字符串 "1" 转成数字 1，转不了自动报错 400
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // POST /posts
  @Post()
  // @Body() 提取 JSON 请求体
  @UseGuards(AuthGuard) // 🔒 加上这行，没有 Token 就不让进！
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  // DELETE /posts/:id
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id:number) {
    return this.postsService.delete(id)
  }


}