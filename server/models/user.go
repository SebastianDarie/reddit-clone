package models

import (
	"time"
)

type User struct {
	ID          int `gorm:"primaryKey"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Username    string      `json:"username" gorm:"username; not null; unique"`
	Email       string      `json:"email" gorm:"email; not null; unique"`
	Password    string      `json:"-" gorm:"password;"`
	PhotoURL    string      `json:"photoUrl" gorm:"default: 'https://i.imgur.com/sJ3CT4V.png'"`
	Communities []Community `json:"communities" gorm:"many2many:user_communities;"`
	Posts       []Post      `json:"posts"`
	Upvotes     []Upvote    `json:"upvotes"`
}

type UserInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
