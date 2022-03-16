package resolvers

import (
	"context"
	"fmt"

	"github.com/SebastianDarie/reddit-clone/server/models"
	"github.com/SebastianDarie/reddit-clone/server/utils"
)

func (r *queryResolver) Posts(ctx context.Context, limit int, cursor *string) (*models.PaginatedPosts, error) {
	realLimit := utils.Min(50, limit)
	realLimitPlusOne := realLimit + 1
	fmt.Print(realLimitPlusOne)
	return nil, nil
}

func (r *queryResolver) Post(ctx context.Context, id int) (*models.Post, error) {
	post := models.Post{ID: id}

	if err := r.DB.First(&post).Error; err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *mutationResolver) CreatePost(ctx context.Context, input models.PostInput) (*models.Post, error) {
	post := models.Post{
		Title: input.Title,
		Text:  input.Text,
	}

	if err := r.DB.Create(&post).Error; err != nil {
		return nil, err
	}

	return &post, nil
}
