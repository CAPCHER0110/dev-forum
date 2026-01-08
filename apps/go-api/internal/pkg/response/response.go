package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response 统一响应结构体
type Response struct {
	Code    int         `json:"code"`    // 自定义业务错误码
	Message string      `json:"message"` // 错误提示信息
	Data    interface{} `json:"data"`    // 成功时的返回数据
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0, // 0 通常表示成功
		Message: "OK",
		Data:    data,
	})
}

// Fail 失败响应
func Fail(c *gin.Context, httpStatus int, code int, msg string) {
	c.JSON(httpStatus, Response{
		Code:    code,
		Message: msg,
		Data:    nil,
	})
}
