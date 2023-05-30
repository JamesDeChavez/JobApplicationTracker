package main

import (
	"log"
	"os"

	"github.com/JamesDeChavez/JobApplicationTracker/api"
	"github.com/JamesDeChavez/JobApplicationTracker/models"
	"github.com/JamesDeChavez/JobApplicationTracker/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal(err)
	}
	config := storage.Config{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  os.Getenv("DB_SSLMODE"),
	}

	db, err := storage.NewConnection(&config)
	if err != nil {
		log.Fatal("Error connecting to database")
	}
	err = models.MigrateUsers(db)
	if err != nil {
		log.Fatal("Error migrating users")
	}
	err = models.MigrateApplications(db)
	if err != nil {
		log.Fatal("Error migrating applications")
	}

	userRepo := api.UserRepository{
		DB: db,
	}
	appRepo := api.AppRepository{
		DB: db,
	}

	app := fiber.New()
	app.Use(cors.New())
	userRepo.SetupUserRoutes(app)
	appRepo.SetupAppRoutes(app)
	app.Listen(":8080")

}
