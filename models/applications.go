package models

import "gorm.io/gorm"

type Application struct {
	ID       uint    `gorm:"primary key;autoIncrement" json:"id"`
	Company  *string `json:"company"`
	Position *string `json:"position"`
	Status   *string `json:"status"`
	URL      *string `json:"url"`
	UserID   *string `json:"userid"`
}

func MigrateApplications(db *gorm.DB) error {
	err := db.AutoMigrate(&Application{})
	return err
}
