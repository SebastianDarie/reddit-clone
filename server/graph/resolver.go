package graph

//go:generate go run github.com/99designs/gqlgen generate

import "github.com/SebastianDarie/reddit-clone/server/graph/model"

type Resolver struct {
	todos []*model.Todo
}
