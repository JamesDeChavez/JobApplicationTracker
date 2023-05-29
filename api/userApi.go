package api

import (
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/JamesDeChavez/JobApplicationTracker/models"
	"github.com/JamesDeChavez/JobApplicationTracker/util"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserRes struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
}

type Repository struct {
	DB *gorm.DB
}

type JWTClaims struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func (repo *Repository) CreateUser(context *fiber.Ctx) error {
	user := User{}
	userRes := UserRes{}

	err := context.BodyParser(&user)
	if err != nil {
		context.Status(http.StatusUnprocessableEntity).JSON(
			fiber.Map{"message": "Error parsing body"},
		)
		return err
	}

	if err := repo.DB.Where("username = ?", user.Username).First(&models.User{}).Error; err == nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Username alread exists"},
		)
		return err
	}

	hashedPassword, err := util.HashPassword(user.Password)
	if err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error creating user"},
		)
		return err
	}
	user.Password = hashedPassword

	err = repo.DB.Create(&user).First(&userRes).Error
	if err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error creating user"},
		)
		return err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		ID:       strconv.Itoa(int(userRes.ID)),
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    strconv.Itoa(int(userRes.ID)),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	})

	secretKey := os.Getenv("JWT_SECRET_KEY")
	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return err
	}

	context.Status(http.StatusOK).JSON(
		fiber.Map{
			"message": "User created successfully",
			"token":   signedToken,
			"user":    userRes,
		},
	)
	return nil
}

func (repo *Repository) GetUserById(context *fiber.Ctx) error {
	user := &models.User{}
	id := context.Params("id")
	if id == "" {
		context.Status(http.StatusInternalServerError).JSON(
			fiber.Map{"message": "ID cannot be empty"},
		)
		return nil
	}
	if err := repo.DB.First(&user, id).Error; err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error getting user"},
		)
		return err
	}

	userRes := &UserRes{
		ID:       user.ID,
		Username: *user.Username,
	}

	context.Status(http.StatusOK).JSON(
		fiber.Map{
			"message": "User fetched successfully",
			"user":    userRes,
		},
	)
	return nil
}

func (repo *Repository) GetUserLogin(context *fiber.Ctx) error {
	userReq := User{}
	userModel := &models.User{}
	userRes := &UserRes{}

	err := context.BodyParser(&userReq)
	if err != nil {
		context.Status(http.StatusUnprocessableEntity).JSON(
			fiber.Map{"message": "Error parsing body"},
		)
		return err
	}

	if err := repo.DB.Where("username = ?", userReq.Username).First(&userModel).Error; err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error getting user"},
		)
		return err
	}

	if err := util.VerifyPassword(userReq.Password, *userModel.Password); err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Incorrect login credentials"},
		)
		return err
	}

	userRes.ID = userModel.ID
	userRes.Username = *userModel.Username

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		ID:       strconv.Itoa(int(userRes.ID)),
		Username: userRes.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    strconv.Itoa(int(userRes.ID)),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	})

	secretKey := os.Getenv("JWT_SECRET_KEY")
	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return err
	}

	context.Status(http.StatusOK).JSON(
		fiber.Map{
			"message": "User fetched successfully",
			"user":    userRes,
			"token":   signedToken,
		},
	)
	return nil
}

func (repo *Repository) GetUsers(context *fiber.Ctx) error {
	users := &[]models.User{}

	if err := repo.DB.Find(&users).Error; err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error getting users"},
		)
		return err
	}

	context.Status(http.StatusOK).JSON(
		fiber.Map{
			"message": "Users fetched successfully",
			"users":   users,
		},
	)
	return nil
}

func (repo *Repository) DeleteUser(context *fiber.Ctx) error {
	user := models.User{}
	id := context.Params("id")
	if id == "" {
		context.Status(http.StatusInternalServerError).JSON(
			fiber.Map{"message": "ID cannot be empty"},
		)
	}
	if err := repo.DB.Delete(&user, id).Error; err != nil {
		context.Status(http.StatusBadRequest).JSON(
			fiber.Map{"message": "Error deleting user"},
		)
		return err
	}
	context.Status(http.StatusOK).JSON(
		fiber.Map{"message": "User deleted successfully"},
	)
	return nil
}

func (repo *Repository) SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	api.Get("/users", repo.GetUsers)
	api.Get("/get_user/id/:id", repo.GetUserById)
	api.Get("/get_user/login", repo.GetUserLogin)
	api.Post("/create_user", repo.CreateUser)
	api.Delete("/delete_user/:id", repo.DeleteUser)
}
