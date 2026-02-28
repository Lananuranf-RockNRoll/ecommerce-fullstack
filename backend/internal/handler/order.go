package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ecommerce/app/internal/model"
	"ecommerce/app/internal/service"
)

type OrderHandler struct{ svc service.OrderService }

func NewOrderHandler(svc service.OrderService) *OrderHandler {
	return &OrderHandler{svc}
}

func (h *OrderHandler) Create(c *gin.Context) {
	var req model.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, _ := c.Get("user_id")
	order, err := h.svc.Create(userID.(string), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, order)
}

func (h *OrderHandler) List(c *gin.Context) {
	userID, _ := c.Get("user_id")
	orders, err := h.svc.List(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *OrderHandler) GetByID(c *gin.Context) {
	order, err := h.svc.GetByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, order)
}
