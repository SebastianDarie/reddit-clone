//go:generate go run github.com/99designs/gqlgen --verbose
package resolvers

import (
	"github.com/SebastianDarie/reddit-clone/server/dataloader"
	"github.com/SebastianDarie/reddit-clone/server/graph/generated"
	"gorm.io/gorm"
)

type Resolver struct {
	DB          *gorm.DB
	DataLoaders dataloader.Retriever
}

func (r *Resolver) Mutation() generated.MutationResolver {
	return &mutationResolver{r}
}
func (r *Resolver) Query() generated.QueryResolver {
	return &queryResolver{r}
}

type mutationResolver struct{ *Resolver }

type queryResolver struct{ *Resolver }
