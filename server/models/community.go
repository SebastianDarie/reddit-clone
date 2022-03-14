package models

import "time"

type Community struct {
	ID          int `gorm:"primaryKey"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Name        string  `json:"name" gorm:"name; not null; unique"`
	Description string  `json:"description" gorm:"description; not null"`
	Posts       []Post  `json:"posts"`
	Users       []*User `gorm:"many2many:user_communities;"`
}
