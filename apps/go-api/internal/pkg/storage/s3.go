package storage

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"

	"go-api/internal/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type S3Service struct {
	client *s3.Client
	bucket string
}

func NewS3Service(cfg config.AWSConfig) (*S3Service, error) {
	// 1. 加载 AWS 配置，强制使用 Path Style (MinIO 必须)
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:           cfg.Endpoint,
			SigningRegion: cfg.Region,
		}, nil
	})

	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(cfg.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, "")),
		awsconfig.WithEndpointResolverWithOptions(customResolver),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.UsePathStyle = true // MinIO 关键设置
	})

	return &S3Service{client: client, bucket: cfg.Bucket}, nil
}

func (s *S3Service) UploadFile(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	// 2. 生成唯一文件名
	ext := filepath.Ext(fileHeader.Filename)
	newFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// 3. 上传
	_, err := s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(newFileName),
		Body:        file,
		ContentType: aws.String(fileHeader.Header.Get("Content-Type")),
		// ACL:    types.ObjectCannedACLPublicRead, // 如果 Bucket 没设 Public 策略，这里需要加 ACL
	})
	if err != nil {
		return "", err
	}

	// 4. 返回完整 URL (如果是本地开发，通常返回相对路径或完整路径)
	// 注意：在 Docker 网络里，这里是 minio:9000，但浏览器需要 localhost:9001 或 nginx 转发的地址
	// 这里简单返回文件名，让前端拼接，或者返回相对路径
	return newFileName, nil
}
