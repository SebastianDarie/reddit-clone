package resolvers

import (
	"context"

	"github.com/SebastianDarie/reddit-clone/server/models"
	"github.com/SebastianDarie/reddit-clone/server/utils"
	"github.com/gin-contrib/sessions"
)

func (r *queryResolver) Users(ctx context.Context) ([]*models.User, error) {
	var users []*models.User

	if err := r.DB.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

func (r *queryResolver) User(ctx context.Context, id int) (*models.User, error) {
	user := models.User{ID: id}

	if err := r.DB.First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *queryResolver) Me(ctx context.Context) (*models.User, error) {
	gc, err := utils.GinContextFromContext(ctx)
	if err != nil {
		return nil, err
	}

	session := sessions.Default(gc)
	id := session.Get("userId")
	if id == nil {
		return nil, nil
	}

	user := models.User{ID: id.(int)}

	if err := r.DB.First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}
