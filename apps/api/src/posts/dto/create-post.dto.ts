import { IsString, IsNotEmpty, MinLength } from 'class-validator';

// 这是一个 DTO (Data Transfer Object)
// 它的作用就是定义前端传过来的参数长什么样，并做校验
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @MinLength(10, { message: '内容太短了，能不能多写点？' })
  content: string;
}