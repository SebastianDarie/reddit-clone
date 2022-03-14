package dataloader

import (
	"context"
	"errors"
	"time"

	"github.com/SebastianDarie/reddit-clone/server/db"
	"github.com/SebastianDarie/reddit-clone/server/models"
)

type loadersKey string

const key = loadersKey("loaders")

type DataLoaders struct {
	NewUserLoaderConfig *UserLoader
}

func newDataLoaders() *DataLoaders {
	return &DataLoaders{
		NewUserLoaderConfig: NewUserLoaderConfig(),
	}
}

type Retriever interface {
	Retrieve(context.Context) *DataLoaders
}

type retriever struct {
	key loadersKey
}

func (r *retriever) Retrieve(ctx context.Context) *DataLoaders {
	return ctx.Value(r.key).(*DataLoaders)
}

func NewRetriever() Retriever {
	return &retriever{key: key}
}

func NewUserLoaderConfig() *UserLoader {
	return &UserLoader{
		maxBatch: 100,
		wait:     1 * time.Millisecond,
		fetch: func(userIds []int) ([]*models.User, []error) {
			var users []*models.User
			var errs []error
			db := db.GetDB()

			if err := db.Where("id IN (?)", userIds).Find(&users).Error; err != nil {
				return nil, []error{err}
			}

			for i, user := range users {
				if user.ID != userIds[i] {
					errs = append(errs, errors.New("user id mismatch"))
				}
			}

			return users, errs
		},
	}
}
