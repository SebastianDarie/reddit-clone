package resolvers

import (
	"context"
	"errors"
	"fmt"

	"github.com/SebastianDarie/reddit-clone/server/models"
	"github.com/SebastianDarie/reddit-clone/server/utils"
)

func (r *queryResolver) GetCommunities(ctx context.Context) ([]*models.Community, error) {
	var communities []*models.Community

	if err := r.DB.Find(&communities).Error; err != nil {
		return nil, err
	}

	return communities, nil
}

func (r *queryResolver) GetCommunity(ctx context.Context, id int) (*models.Community, error) {
	community := models.Community{ID: id}

	if err := r.DB.First(&community).Error; err != nil {
		return nil, err
	}

	return &community, nil
}

func (r *mutationResolver) CreateCommunity(ctx context.Context, name string, description string) (*models.Community, error) {
	if !utils.IsAuthenticated(ctx) {
		return nil, fmt.Errorf("Not authenticated")
	}

	id, err := utils.GetUserIdFromContext(ctx)
	if err != nil {
		return nil, err
	}

	user := models.User{ID: id}
	if err := r.DB.First(&user).Error; err != nil {
		return nil, err
	}

	community := models.Community{
		Name:        name,
		Description: description,
		Users:       []*models.User{&user},
	}

	if err := r.DB.Create(&community).Error; err != nil {
		return nil, err
	}

	return &community, nil
}

func (r *mutationResolver) LeaveCommunity(ctx context.Context, id int) (bool, error) {
	if !utils.IsAuthenticated(ctx) {
		return false, fmt.Errorf("Not authenticated")
	}

	userId, err := utils.GetUserIdFromContext(ctx)
	if err != nil {
		return false, err
	}

	community := models.Community{ID: id}
	if err := r.DB.First(&community).Error; err != nil {
		return false, err
	}

	if err := r.DB.Model(&community).Association("Users").Delete(userId).Error; err != nil {
		return false, errors.New("User is not a member of this community")
	}

	return true, nil
}

func (r *mutationResolver) DeleteCommunity(ctx context.Context, id int) (bool, error) {
	if !utils.IsAuthenticated(ctx) {
		return false, fmt.Errorf("Not authenticated")
	}

	// TODO: Implement this

	return true, nil
}
