package apperr

const (
	CodeSuccess         = 0
	CodeInvalidParam    = 40001
	CodeUnauthorized    = 40101
	CodeUserNotFound    = 40401
	CodeUserExist       = 40402
	CodeArticleNotExist = 40403
	CodeTitleNotExist   = 40404
	CodeInternalError   = 50001
)

var codeMsg = map[int]string{
	CodeSuccess:         "成功",
	CodeInvalidParam:    "参数错误",
	CodeUnauthorized:    "未授权或Token失效",
	CodeUserNotFound:    "用户不存在",
	CodeUserExist:       "用户已存在",
	CodeArticleNotExist: "文章不存在",
	CodeTitleNotExist:   "标题是必填项",
	CodeInternalError:   "服务器内部故障",
}

func GetMsg(code int) string {
	return codeMsg[code]
}
