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
	if !utils.IsAuthenticated(ctx) {
		return nil, fmt.Errorf("Not authenticated")
	}

	creatorId, err := utils.GetUserIdFromContext(ctx)
	if err != nil {
		return nil, err
	}

	post := models.Post{
		Title:     input.Title,
		Text:      input.Text,
		CreatorID: creatorId,
	}

	if err := r.DB.Create(&post).Error; err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *mutationResolver) UpdatePost(ctx context.Context, id int, title string, text string) (*models.Post, error) {
	creatorId, err := utils.GetUserIdFromContext(ctx)
	if err != nil {
		return nil, err
	}

	post := models.Post{
		ID:        id,
		Title:     title,
		Text:      text,
		CreatorID: creatorId,
	}

	if err := r.DB.Save(&post).Error; err != nil {
		return nil, err
	}

	return &post, nil
}
