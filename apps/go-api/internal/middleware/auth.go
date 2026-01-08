package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// JWTAuth 身份验证中间件
func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 从 Header 提取 Token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "请求未携带Token"})
			c.Abort() // 停止执行后续的处理函数
			return
		}

		// 按空格分割 "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token格式错误"})
			c.Abort()
			return
		}

		// 2. 解析并校验 Token
		tokenString := parts[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token无效或已过期"})
			c.Abort()
			return
		}

		// 3. 提取用户信息并存入 Context
		// 这里 sub 对应的是 UserID
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userID := claims["sub"]
			// 在 Go 里这相当于 ctx.Set("user", user)
			c.Set("userID", userID)
		}

		c.Next() // 继续执行后续逻辑
	}
}
