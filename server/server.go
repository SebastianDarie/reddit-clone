package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/SebastianDarie/reddit-clone/server/db"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// temporary location will move
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

func GinContextToContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), "GinContextKey", c)
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

// func graphqlHandler() gin.HandlerFunc {
// 	h := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolvers.Resolver{}}))

// 	return func(ctx *gin.Context) {
// 		h.ServeHTTP(ctx.Writer, ctx.Request)
// 	}
// }

func playgroundHandler() gin.HandlerFunc {
	h := playground.Handler("GraphQL", "/query")

	return func(ctx *gin.Context) {
		h.ServeHTTP(ctx.Writer, ctx.Request)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db.Init(dsn)

	defer db.Close()

	r := gin.Default()
	r.Use(GinContextToContextMiddleware())
	// r.POST("/query", graphqlHandler())
	r.GET("/", playgroundHandler())
	r.Run()
}
