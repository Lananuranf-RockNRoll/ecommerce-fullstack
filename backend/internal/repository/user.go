package repository

import (
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"ecommerce/app/internal/model"
)

type UserRepository interface {
	Create(u *model.User) error
	FindByEmail(email string) (*model.User, error)
	FindByID(id string) (*model.User, error)
}

type userRepository struct{ db *sql.DB }

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db}
}

func (r *userRepository) Create(u *model.User) error {
	u.ID = uuid.NewString()
	u.Role = "user"
	return r.db.QueryRow(
		`INSERT INTO users (id, name, email, password, role) VALUES ($1,$2,$3,$4,$5) RETURNING created_at`,
		u.ID, u.Name, u.Email, u.Password, u.Role,
	).Scan(&u.CreatedAt)
}

func (r *userRepository) FindByEmail(email string) (*model.User, error) {
	u := &model.User{}
	err := r.db.QueryRow(
		`SELECT id, name, email, password, role, created_at FROM users WHERE email=$1`, email,
	).Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return u, err
}

func (r *userRepository) FindByID(id string) (*model.User, error) {
	u := &model.User{}
	err := r.db.QueryRow(
		`SELECT id, name, email, role, created_at FROM users WHERE id=$1`, id,
	).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return u, err
}
