# apps/go-api/Dockerfile

# Stage 1: Build
FROM golang:1.25-alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /build

# 复制依赖定义
COPY go.mod go.sum ./
RUN go mod download

# 复制所有源码
COPY . .

# 🔥 关键修改：编译路径指向 cmd/server/main.go
RUN go build -o server ./cmd/server/main.go

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /build/server ./server

EXPOSE 4000

CMD ["./server"]