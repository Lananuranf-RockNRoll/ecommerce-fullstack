package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"ecommerce/app/internal/model"
)

type ProductRepository interface {
	Create(p *model.Product) error
	FindAll(q model.ProductListQuery) ([]model.Product, int, error)
	FindByID(id string) (*model.Product, error)
	Update(p *model.Product) error
	Delete(id string) error
	DecrementStock(id string, qty int) error
}

type productRepository struct{ db *sql.DB }

func NewProductRepository(db *sql.DB) ProductRepository {
	return &productRepository{db}
}

func (r *productRepository) Create(p *model.Product) error {
	p.ID = uuid.NewString()
	return r.db.QueryRow(
		`INSERT INTO products (id, name, description, price, stock, image_url, category)
		 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING created_at, updated_at`,
		p.ID, p.Name, p.Description, p.Price, p.Stock, p.ImageURL, p.Category,
	).Scan(&p.CreatedAt, &p.UpdatedAt)
}

func (r *productRepository) FindAll(q model.ProductListQuery) ([]model.Product, int, error) {
	where := "WHERE 1=1"
	args := []interface{}{}
	i := 1

	if q.Category != "" {
		where += fmt.Sprintf(" AND category=$%d", i)
		args = append(args, q.Category)
		i++
	}
	if q.Search != "" {
		where += fmt.Sprintf(" AND (name ILIKE $%d OR description ILIKE $%d)", i, i)
		args = append(args, "%"+q.Search+"%")
		i++
	}

	var total int
	r.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM products %s", where), args...).Scan(&total)

	offset := (q.Page - 1) * q.Limit
	args = append(args, q.Limit, offset)
	rows, err := r.db.Query(
		fmt.Sprintf(`SELECT id, name, description, price, stock, image_url, category, created_at, updated_at
		FROM products %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, where, i, i+1),
		args...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []model.Product
	for rows.Next() {
		var p model.Product
		rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.ImageURL, &p.Category, &p.CreatedAt, &p.UpdatedAt)
		products = append(products, p)
	}
	return products, total, nil
}

func (r *productRepository) FindByID(id string) (*model.Product, error) {
	p := &model.Product{}
	err := r.db.QueryRow(
		`SELECT id, name, description, price, stock, image_url, category, created_at, updated_at FROM products WHERE id=$1`, id,
	).Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.ImageURL, &p.Category, &p.CreatedAt, &p.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return p, err
}

func (r *productRepository) Update(p *model.Product) error {
	_, err := r.db.Exec(
		`UPDATE products SET name=$1, description=$2, price=$3, stock=$4, image_url=$5, category=$6, updated_at=NOW() WHERE id=$7`,
		p.Name, p.Description, p.Price, p.Stock, p.ImageURL, p.Category, p.ID,
	)
	return err
}

func (r *productRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM products WHERE id=$1`, id)
	return err
}

func (r *productRepository) DecrementStock(id string, qty int) error {
	_, err := r.db.Exec(`UPDATE products SET stock=stock-$1 WHERE id=$2 AND stock>=$1`, qty, id)
	return err
}
