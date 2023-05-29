package main

import (
	"fmt"
	"log"
	"os"

	"github.com/JamesDeChavez/RPS-Duel/api"
	"github.com/JamesDeChavez/RPS-Duel/models"
	"github.com/JamesDeChavez/RPS-Duel/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("Hello World")
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

	repo := api.Repository{
		DB: db,
	}

	app := fiber.New()
	repo.SetupRoutes(app)
	app.Listen(":8080")

}
