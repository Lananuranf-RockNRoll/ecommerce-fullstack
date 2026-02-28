package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"ecommerce/app/internal/handler"
	"ecommerce/app/internal/middleware"
	"ecommerce/app/internal/repository"
	"ecommerce/app/internal/service"
)

func main() {
	_ = godotenv.Load()

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "ecommerce"),
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Database not reachable:", err)
	}
	log.Println("✅ Database connected")

	// Repos
	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, getEnv("JWT_SECRET", "supersecret"))
	productService := service.NewProductService(productRepo)
	orderService := service.NewOrderService(orderRepo, productRepo)

	// Handlers
	authHandler := handler.NewAuthHandler(authService)
	productHandler := handler.NewProductHandler(productService)
	orderHandler := handler.NewOrderHandler(orderService)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "ecommerce-api"})
	})

	api := r.Group("/api/v1")
	{
		// Auth
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthRequired(getEnv("JWT_SECRET", "supersecret")), authHandler.Me)
		}

		// Products (public)
		products := api.Group("/products")
		{
			products.GET("", productHandler.List)
			products.GET("/:id", productHandler.GetByID)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthRequired(getEnv("JWT_SECRET", "supersecret")))
		{
			// Admin product management
			protected.POST("/products", middleware.AdminOnly(), productHandler.Create)
			protected.PUT("/products/:id", middleware.AdminOnly(), productHandler.Update)
			protected.DELETE("/products/:id", middleware.AdminOnly(), productHandler.Delete)

			// Orders
			protected.POST("/orders", orderHandler.Create)
			protected.GET("/orders", orderHandler.List)
			protected.GET("/orders/:id", orderHandler.GetByID)
		}
	}

	port := getEnv("PORT", "8080")
	log.Printf("🚀 Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
