package resolvers

import (
	"context"
	"reflect"
	"strings"

	"github.com/SebastianDarie/reddit-clone/server/models"
	"github.com/SebastianDarie/reddit-clone/server/utils"
	"github.com/alexedwards/argon2id"
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

	if err := r.DB.Preload("Posts").First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *queryResolver) Me(ctx context.Context) (*models.User, error) {
	id, err := utils.GetUserIdFromContext(ctx)
	if err != nil {
		return nil, err
	}

	user := models.User{ID: id}

	if err := r.DB.First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *mutationResolver) Register(ctx context.Context, credentials models.RegisterInput) (*models.UserResponse, error) {
	errors := utils.ValidateRegister(&credentials)
	if len(errors) > 0 {
		return &models.UserResponse{Errors: errors}, nil
	}

	hash, err := argon2id.CreateHash(credentials.Password, argon2id.DefaultParams)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Username: credentials.Username,
		Email:    credentials.Email,
		Password: hash,
	}

	if err := r.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	utils.SaveUserIdInSession(ctx, user.ID)

	return &models.UserResponse{User: user}, nil
}

func (r *mutationResolver) Login(ctx context.Context, credentials models.LoginInput) (*models.UserResponse, error) {
	var fieldErrors []models.FieldError
	var user models.User
	if strings.Contains(credentials.UsernameOrEmail, "@") {
		user = models.User{Email: credentials.UsernameOrEmail}
		if err := r.DB.Where(&user).First(&user).Error; err != nil {
			return nil, err
		}
	} else {
		user = models.User{Username: credentials.UsernameOrEmail}
		if err := r.DB.Where(&user).First(&user).Error; err != nil {
			return nil, err
		}
	}

	if reflect.DeepEqual(user, models.User{}) {
		fieldErrors = append(fieldErrors, models.FieldError{
			Field:   "usernameOrEmail",
			Message: "Username doesn't exist",
		})
		return &models.UserResponse{Errors: fieldErrors}, nil
	}

	valid, err := argon2id.ComparePasswordAndHash(credentials.Password, user.Password)
	if err != nil {
		return nil, err
	}
	if !valid {
		fieldErrors = append(fieldErrors, models.FieldError{
			Field:   "password",
			Message: "Incorrect password",
		})
		return &models.UserResponse{Errors: fieldErrors}, nil
	}

	utils.SaveUserIdInSession(ctx, user.ID)

	return &models.UserResponse{User: user}, nil
}

func (r *mutationResolver) Logout(ctx context.Context) (bool, error) {
	gc, err := utils.GinContextFromContext(ctx)
	if err != nil {
		return false, err
	}
	session := sessions.Default(gc)

	session.Delete("userId")
	session.Save()

	return true, nil
}
