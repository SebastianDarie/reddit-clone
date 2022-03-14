package utils

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/99designs/gqlgen/graphql"
	"github.com/SebastianDarie/reddit-clone/server/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/exp/constraints"
)

func Min[T constraints.Ordered](a, b T) T {
	if a < b {
		return a
	}
	return b
}

func GinContextFromContext(ctx context.Context) (*gin.Context, error) {
	ginContext := ctx.Value("GinContextKey")
	if ginContext == nil {
		err := fmt.Errorf("could not retrieve gin.Context")
		return nil, err
	}

	gc, ok := ginContext.(*gin.Context)
	if !ok {
		err := fmt.Errorf("gin.Context has wrong type")
		return nil, err
	}
	return gc, nil
}

func GetUserIdFromContext(ctx context.Context) (int, error) {
	ginContext, err := GinContextFromContext(ctx)
	if err != nil {
		return 0, err
	}

	session := sessions.Default(ginContext)
	id := session.Get("userId")
	if id == nil {
		return 0, nil
	}

	return id.(int), nil
}

func SaveUserIdInSession(ctx context.Context, userId int) {
	gc, _ := GinContextFromContext(ctx)
	// if err != nil {
	// 	return nil, err
	// }
	session := sessions.Default(gc)
	session.Set("userId", userId)
	session.Save()
}

func IsAuthenticated(ctx context.Context) bool {
	userId, err := GetUserIdFromContext(ctx)
	if err != nil {
		return false
	}

	if userId == 0 {
		return false
	}

	return true
}

func ValidateRegister(credentials *models.RegisterInput) []models.FieldError {
	var fieldErrors []models.FieldError

	re := regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	if valid := re.Match([]byte(credentials.Email)); !valid {
		fieldErrors = append(fieldErrors, models.FieldError{Field: "email", Message: "invalid email"})
	}

	if len(credentials.Username) <= 2 {
		fieldErrors = append(fieldErrors, models.FieldError{Field: "username", Message: "username must be at least 3 characters"})
	}

	if strings.Contains(credentials.Username, "@") {
		fieldErrors = append(fieldErrors, models.FieldError{Field: "username", Message: "username cannot contain @"})
	}

	if len(credentials.Password) <= 2 {
		fieldErrors = append(fieldErrors, models.FieldError{Field: "password", Message: "password must be at least 3 characters"})
	}

	return fieldErrors
}

func GetPreloads(ctx context.Context) []string {
	return GetNestedPreloads(
		graphql.GetOperationContext(ctx),
		graphql.CollectFieldsCtx(ctx, nil),
		"",
	)
}

func GetNestedPreloads(ctx *graphql.OperationContext, fields []graphql.CollectedField, prefix string) (preloads []string) {
	for _, column := range fields {
		prefixColumn := GetPreloadString(prefix, column.Name)
		preloads = append(preloads, prefixColumn)
		preloads = append(preloads, GetNestedPreloads(ctx, graphql.CollectFields(ctx, column.Selections, nil), prefixColumn)...)
	}
	return
}

func GetPreloadString(prefix, name string) string {
	if len(prefix) > 0 {
		return prefix + "." + name
	}
	return name
}
