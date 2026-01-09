import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private bucket = process.env.S3_BUCKET || 'forum-uploads';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT || 'http://minio:9000', // Docker 内部地址
      forcePathStyle: true, // MinIO 必须开启
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'admin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'password123',
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is empty');
    }

    // 生成唯一文件名
    const filename = `${uuidv4()}${extname(file.originalname)}`;
    const key = filename; // 在 S3 中 Key 就是文件名

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      this.logger.log(`File uploaded successfully: ${filename}`);

      // 返回可访问的 URL
      // 注意：这里返回的路径需要配合 Nginx 的 rewrite 规则
      return {
        url: `/uploads/${filename}`,
        filename: filename,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}