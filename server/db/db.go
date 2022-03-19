package db

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func Init(dsn string) error {
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	return nil
}

func Close() {
	pg, err := db.DB()
	if err != nil {
		log.Fatal(err)
	}
	pg.Close()
}

func GetDB() *gorm.DB {
	return db
}
