package dataloader

import (
	"context"

	"github.com/gin-gonic/gin"
)

func Middleware() func(gin.HandlerFunc) gin.HandlerFunc {
	return func(next gin.HandlerFunc) gin.HandlerFunc {
		return func(c *gin.Context) {
			ctx := context.WithValue(c.Request.Context(), "GinContextKey", c)
			dataLoaders := newDataLoaders()
			dlCtx := context.WithValue(ctx, key, dataLoaders)
			c.Request = c.Request.WithContext(dlCtx)
			next(c)
		}
	}
}
