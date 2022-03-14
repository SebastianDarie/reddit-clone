package resolvers

import (
	"context"
	"fmt"

	"github.com/SebastianDarie/reddit-clone/server/models"
	"github.com/SebastianDarie/reddit-clone/server/utils"
	"gorm.io/gorm"
)

func (r *queryResolver) Posts(ctx context.Context, limit int, cursor *string) (*models.PaginatedPosts, error) {
	preloads := utils.GetPreloads(ctx)
	fmt.Print(preloads)
	realLimit := utils.Min(50, limit)
	realLimitPlusOne := realLimit + 1
	fmt.Print(realLimitPlusOne)

	var result []models.Post
	qb := r.DB.Select("posts.*").Order("posts.created_at desc").Limit(realLimitPlusOne)
	if cursor != nil {
		qb.Where("posts.created_at < ?", *cursor)
	}

	if err := qb.Find(&result).Error; err != nil {
		return nil, err
	}

	return &models.PaginatedPosts{
		Posts:   result[:realLimit],
		HasMore: len(result) == realLimitPlusOne,
	}, nil
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
	if !utils.IsAuthenticated(ctx) {
		return nil, fmt.Errorf("Not authenticated")
	}

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

func (r *mutationResolver) DeletePost(ctx context.Context, id int) (bool, error) {
	if !utils.IsAuthenticated(ctx) {
		return false, fmt.Errorf("Not authenticated")
	}

	creatorId, err := utils.GetUserIdFromContext(ctx)
	if err != nil {
		return false, err
	}

	post := models.Post{
		ID:        id,
		CreatorID: creatorId,
	}

	if err := r.DB.Delete(&post).Error; err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) Vote(ctx context.Context, postId int, value int) (bool, error) {
	if !utils.IsAuthenticated(ctx) {
		return false, fmt.Errorf("Not authenticated")
	}

	var realValue int

	isUpvote := value != -1
	if isUpvote {
		realValue = 1
	} else {
		realValue = -1
	}

	userId, err := utils.GetUserIdFromContext(ctx)
	if err != nil {
		return false, err
	}

	return submitVote(r.DB, postId, userId, realValue)
}

func submitVote(db *gorm.DB, postId int, userId int, realValue int) (bool, error) {
	var upvote *models.Upvote
	input := models.Upvote{
		PostID: postId,
		UserID: userId,
	}

	if err := db.Find(&upvote, input).Error; err != nil {
		return false, err
	}

	if upvote != nil {
		if upvote.Value != realValue {
			db.Transaction(func(tx *gorm.DB) error {
				if err := tx.Model(&upvote).Update("value", models.Upvote{Value: realValue}).Error; err != nil {
					return err
				}

				if err := tx.Model(&models.Post{ID: postId}).Update("points", gorm.Expr("points + ?", 2*realValue)).Error; err != nil {
					return err
				}

				return nil
			})
		}
	} else if upvote == nil {
		db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&models.Upvote{
				PostID: postId,
				UserID: userId,
				Value:  realValue,
			}).Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Post{ID: postId}).Update("points", gorm.Expr("points + ?", realValue)).Error; err != nil {
				return err
			}

			return nil
		})
	}

	return true, nil
}
