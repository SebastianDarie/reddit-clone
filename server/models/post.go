package models

import (
	"time"
)

type Post struct {
	ID          int `gorm:"primaryKey"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Title       string    `json:"title"`
	Text        string    `json:"text"`
	Points      int       `json:"points" gorm:"default: 0"`
	CreatorID   int       `json:"creatorId"`
	Creator     User      `json:"creator"`
	CommunityID int       `json:"communityId"`
	Community   Community `json:"community"`
	Upvotes     []Upvote  `json:"upvotes"`
}

type PaginatedPosts struct {
	Posts   []Post
	HasMore bool
}

type PostInput struct {
	Title string `json:"title"`
	Text  string `json:"text"`
}
