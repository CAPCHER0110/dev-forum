import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiResponse } from '@forum/shared-types'; // 使用共享类型

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(AuthGuard) // 保护接口，只有登录用户能上传
  @UseInterceptors(FileInterceptor('file')) // 处理 multipart/form-data
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 限制 5MB
          // new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }), // 可选：限制类型
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
      return this.uploadService.uploadFile(file);
  }
}