package api

import (
	"net/http"

	"github.com/JamesDeChavez/JobApplicationTracker/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Application struct {
	Company  string `json:"company"`
	Position string `json:"position"`
	Status   string `json:"status"`
	URL      string `json:"url"`
	UserID   string `json:"userid"`
}

type UpdateApplication struct {
	ID     uint   `json:"id"`
	Status string `json:"status"`
}

type AppRepository struct {
	DB *gorm.DB
}

func (repo *AppRepository) CreateApplication(context *fiber.Ctx) error {
	application := Application{}

	err := context.BodyParser(&application)
	if err != nil {
		context.Status(http.StatusUnprocessableEntity).JSON(
			fiber.Map{"message": "Error parsing body"},
		)
		return err
	}
	err = repo.DB.Create(&application).First(&application).Error
	if err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error creating application"},
		)
		return err
	}
	context.Status(http.StatusCreated).JSON(
		fiber.Map{
			"message":     "Application created",
			"application": application,
		},
	)
	return nil
}

func (repo *AppRepository) GetApplicationsByUserID(context *fiber.Ctx) error {
	applications := &[]models.Application{}
	userID := context.Params("userid")

	err := repo.DB.Where("user_id = ?", userID).Find(&applications).Error
	if err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error getting applications"},
		)
		return err
	}

	context.Status(http.StatusOK).JSON(
		fiber.Map{
			"message":      "Applications fetched succesfully",
			"applications": applications,
		},
	)
	return nil
}

func (repo *AppRepository) UpdateApplicationStatus(context *fiber.Ctx) error {
	update := UpdateApplication{}

	err := context.BodyParser(&update)
	if err != nil {
		context.Status(http.StatusUnprocessableEntity).JSON(
			fiber.Map{"message": "Error parsing body"},
		)
		return err
	}

	err = repo.DB.Model(&models.Application{}).Where("id = ?", update.ID).Update("status", update.Status).Error
	if err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error updating application"},
		)
		return err
	}

	context.Status(http.StatusOK).JSON(
		fiber.Map{
			"message": "Application updated succesfully",
			"update":  update,
		},
	)
	return nil
}

func (repo *AppRepository) DeleteApplication(context *fiber.Ctx) error {
	application := models.Application{}
	id := context.Params("id")
	if id == "" {
		context.Status(http.StatusInternalServerError).JSON(
			fiber.Map{"message": "ID cannot be empty"},
		)
	}
	if err := repo.DB.Delete(&application, id).Error; err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error deleting application"},
		)
		return err
	}
	context.Status(http.StatusOK).JSON(
		fiber.Map{"message": "Application deleted successfully"},
	)
	return nil
}

func (repo *AppRepository) SetupAppRoutes(app *fiber.App) {
	api := app.Group("/api")
	api.Post("/create_app", repo.CreateApplication)
	api.Get("/get_apps/:userid", repo.GetApplicationsByUserID)
	api.Put("/update_app", repo.UpdateApplicationStatus)
	api.Delete("/delete_app/:id", repo.DeleteApplication)
}
