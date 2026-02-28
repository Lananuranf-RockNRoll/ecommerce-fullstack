package service

import (
	"errors"

	"ecommerce/app/internal/model"
	"ecommerce/app/internal/repository"
)

type ProductService interface {
	Create(req *model.CreateProductRequest) (*model.Product, error)
	List(q model.ProductListQuery) ([]model.Product, int, error)
	GetByID(id string) (*model.Product, error)
	Update(id string, req *model.CreateProductRequest) (*model.Product, error)
	Delete(id string) error
}

type productService struct{ repo repository.ProductRepository }

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{repo}
}

func (s *productService) Create(req *model.CreateProductRequest) (*model.Product, error) {
	p := &model.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
	}
	if err := s.repo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *productService) List(q model.ProductListQuery) ([]model.Product, int, error) {
	if q.Limit <= 0 {
		q.Limit = 12
	}
	if q.Page <= 0 {
		q.Page = 1
	}
	return s.repo.FindAll(q)
}

func (s *productService) GetByID(id string) (*model.Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, errors.New("product not found")
	}
	return p, nil
}

func (s *productService) Update(id string, req *model.CreateProductRequest) (*model.Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil || p == nil {
		return nil, errors.New("product not found")
	}
	p.Name = req.Name
	p.Description = req.Description
	p.Price = req.Price
	p.Stock = req.Stock
	p.ImageURL = req.ImageURL
	p.Category = req.Category
	return p, s.repo.Update(p)
}

func (s *productService) Delete(id string) error {
	return s.repo.Delete(id)
}
