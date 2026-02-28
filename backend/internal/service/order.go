package service

import (
	"errors"

	"ecommerce/app/internal/model"
	"ecommerce/app/internal/repository"
)

type OrderService interface {
	Create(userID string, req *model.CreateOrderRequest) (*model.Order, error)
	List(userID string) ([]model.Order, error)
	GetByID(id string) (*model.Order, error)
}

type orderService struct {
	orderRepo   repository.OrderRepository
	productRepo repository.ProductRepository
}

func NewOrderService(orderRepo repository.OrderRepository, productRepo repository.ProductRepository) OrderService {
	return &orderService{orderRepo, productRepo}
}

func (s *orderService) Create(userID string, req *model.CreateOrderRequest) (*model.Order, error) {
	var items []model.OrderItem
	var total float64

	for _, itemReq := range req.Items {
		product, err := s.productRepo.FindByID(itemReq.ProductID)
		if err != nil || product == nil {
			return nil, errors.New("product not found: " + itemReq.ProductID)
		}
		if product.Stock < itemReq.Quantity {
			return nil, errors.New("insufficient stock for: " + product.Name)
		}

		itemTotal := product.Price * float64(itemReq.Quantity)
		total += itemTotal

		items = append(items, model.OrderItem{
			ProductID: itemReq.ProductID,
			Quantity:  itemReq.Quantity,
			Price:     product.Price,
			Product:   product,
		})
	}

	order := &model.Order{
		UserID:     userID,
		TotalPrice: total,
		Items:      items,
	}

	if err := s.orderRepo.Create(order); err != nil {
		return nil, err
	}

	// Decrement stock
	for _, item := range req.Items {
		s.productRepo.DecrementStock(item.ProductID, item.Quantity)
	}

	return order, nil
}

func (s *orderService) List(userID string) ([]model.Order, error) {
	return s.orderRepo.FindByUserID(userID)
}

func (s *orderService) GetByID(id string) (*model.Order, error) {
	return s.orderRepo.FindByID(id)
}
