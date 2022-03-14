package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/SebastianDarie/reddit-clone/server/cache"
	"github.com/SebastianDarie/reddit-clone/server/dataloader"
	"github.com/SebastianDarie/reddit-clone/server/db"
	"github.com/SebastianDarie/reddit-clone/server/graph/generated"
	"github.com/SebastianDarie/reddit-clone/server/resolvers"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func GinContextToContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), "GinContextKey", c)
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

func graphqlHandler(cache graphql.Cache) gin.HandlerFunc {
	h := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolvers.Resolver{
		DB:          db.GetDB(),
		DataLoaders: dataloader.NewRetriever(),
	}}))
	h.Use(extension.AutomaticPersistedQuery{Cache: cache})

	return func(ctx *gin.Context) {
		h.ServeHTTP(ctx.Writer, ctx.Request)
	}
}

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

	db.Migrate()

	defer db.Close()

	apqCache, err := cache.NewCache(os.Getenv("REDIS_ADDRESS"), 24*time.Hour)
	if err != nil {
		log.Fatalf("Error creating APQ redis cache: %v", err)
	}

	dlMiddleware := dataloader.Middleware()

	r := gin.Default()
	store, _ := redis.NewStore(10, "tcp", os.Getenv("REDIS_ADDRESS"), "", []byte("secret"))
	r.Use(sessions.Sessions("qid", store))
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowCredentials: true,
	}))
	r.Use(GinContextToContextMiddleware())
	queryHandler := graphqlHandler(apqCache)
	r.POST("/query", dlMiddleware(queryHandler))
	r.GET("/", playgroundHandler())
	r.Run()
}
