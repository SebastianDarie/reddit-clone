package middleware

import (
	"context"
	"errors"

	"github.com/SebastianDarie/reddit-clone/server/utils"
	"github.com/gin-contrib/sessions"
)

func IsAuth(next func(ctx context.Context) error) func(ctx context.Context) error {
	return func(ctx context.Context) error {
		gc, err := utils.GinContextFromContext(ctx)
		if err != nil {
			return err
		}

		session := sessions.Default(gc)
		id := session.Get("userId")
		if id == nil {
			return errors.New("Not authenticated")
		}

		return next(ctx)
	}
}
