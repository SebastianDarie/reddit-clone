package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"username; not null; unique"`
	Email    string `json:"email" gorm:"email; not null; unique"`
	Password string `json:"-" gorm:"password;"`
	PhotoURL string `json:"photoUrl" gorm:"default: 'https://i.imgur.com/sJ3CT4V.png'"`
}

type UserInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
