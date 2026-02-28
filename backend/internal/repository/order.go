package repository

import (
	"database/sql"

	"github.com/google/uuid"
	"ecommerce/app/internal/model"
)

type OrderRepository interface {
	Create(o *model.Order) error
	FindByUserID(userID string) ([]model.Order, error)
	FindByID(id string) (*model.Order, error)
}

type orderRepository struct{ db *sql.DB }

func NewOrderRepository(db *sql.DB) OrderRepository {
	return &orderRepository{db}
}

func (r *orderRepository) Create(o *model.Order) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	o.ID = uuid.NewString()
	o.Status = "pending"
	err = tx.QueryRow(
		`INSERT INTO orders (id, user_id, status, total_price) VALUES ($1,$2,$3,$4) RETURNING created_at, updated_at`,
		o.ID, o.UserID, o.Status, o.TotalPrice,
	).Scan(&o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return err
	}

	for i, item := range o.Items {
		o.Items[i].ID = uuid.NewString()
		o.Items[i].OrderID = o.ID
		_, err = tx.Exec(
			`INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4,$5)`,
			o.Items[i].ID, o.ID, item.ProductID, item.Quantity, item.Price,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *orderRepository) FindByUserID(userID string) ([]model.Order, error) {
	rows, err := r.db.Query(
		`SELECT id, user_id, status, total_price, created_at, updated_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.Order
	for rows.Next() {
		var o model.Order
		rows.Scan(&o.ID, &o.UserID, &o.Status, &o.TotalPrice, &o.CreatedAt, &o.UpdatedAt)
		o.Items, _ = r.getOrderItems(o.ID)
		orders = append(orders, o)
	}
	return orders, nil
}

func (r *orderRepository) FindByID(id string) (*model.Order, error) {
	o := &model.Order{}
	err := r.db.QueryRow(
		`SELECT id, user_id, status, total_price, created_at, updated_at FROM orders WHERE id=$1`, id,
	).Scan(&o.ID, &o.UserID, &o.Status, &o.TotalPrice, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, err
	}
	o.Items, _ = r.getOrderItems(o.ID)
	return o, nil
}

func (r *orderRepository) getOrderItems(orderID string) ([]model.OrderItem, error) {
	rows, err := r.db.Query(
		`SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
		 p.name, p.image_url FROM order_items oi
		 JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1`, orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.OrderItem
	for rows.Next() {
		var item model.OrderItem
		item.Product = &model.Product{}
		rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.Quantity, &item.Price,
			&item.Product.Name, &item.Product.ImageURL)
		items = append(items, item)
	}
	return items, nil
}
