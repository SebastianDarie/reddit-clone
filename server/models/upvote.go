package models

type Upvote struct {
	Value  int  `json:"value"`
	UserID int  `json:"userId" gorm:"primary_key, constraint: OnDelete: CASCADE"`
	User   User `json:"user"`
	PostID int  `json:"postId" gorm:"primary_key, constraint: OnDelete: CASCADE"`
	Post   Post `json:"post"`
}
