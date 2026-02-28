# 🛍️ Luxe Store — Fullstack E-Commerce

> Fullstack e-commerce application built with Go, React, PostgreSQL, Docker & Kubernetes — deployed on AWS EKS.

![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?logo=kubernetes)
![AWS](https://img.shields.io/badge/AWS-EKS-FF9900?logo=amazon-aws)

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS EKS Cluster                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Kubernetes Namespace                 │    │
│  │                                                       │    │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────────┐  │    │
│  │   │ Frontend │    │ Backend  │    │  PostgreSQL   │  │    │
│  │   │ (Nginx)  │───▶│  (Go)    │───▶│  (Stateful)  │  │    │
│  │   │ 2 pods   │    │ 2 pods   │    │  1 pod + PVC │  │    │
│  │   └──────────┘    └──────────┘    └──────────────┘  │    │
│  │         │               │                            │    │
│  │   ┌─────▼───────────────▼──────────────────────┐    │    │
│  │   │              Ingress (Nginx)                │    │    │
│  │   │         /api/* → backend                   │    │    │
│  │   │         /*    → frontend                   │    │    │
│  │   └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ▲                                    │
│                    Load Balancer (AWS ALB)                    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go 1.22 + Gin Framework |
| Frontend | React 18 + TypeScript + Vite |
| Database | PostgreSQL 16 |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Auth | JWT (RS256) |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes (EKS) |
| Cloud | AWS (EKS, ECR, ALB) |

## ✨ Features

- 🛒 Product catalog with filtering & search
- 🛍️ Shopping cart with real-time updates
- 🔐 JWT authentication (register/login)
- 📦 Order management
- 👑 Admin panel for product management
- 📱 Fully responsive design
- 🐳 Fully containerized with Docker
- ☸️ Kubernetes-ready with HPA (auto-scaling)

## 🏃 Quick Start

### Prerequisites
- Docker Desktop
- Go 1.22+
- Node.js 20+

### Option 1: Docker Compose (Recommended)
```bash
# Clone repo
git clone https://github.com/yourname/ecommerce
cd ecommerce

# Start all services
docker compose up --build

# App akan jalan di:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# API docs: http://localhost:8080/health
```

### Option 2: Local Development
```bash
# Backend
cd backend
cp .env.example .env
go mod tidy
go run ./cmd/api

# Frontend (terminal baru)
cd frontend
npm install
npm run dev
```

### Option 3: Kubernetes (minikube)
```bash
make minikube-start
make build
make minikube-image-load
make k8s-deploy
make k8s-port-forward
```

## 📡 API Endpoints

```
POST   /api/v1/auth/register       # Register user
POST   /api/v1/auth/login          # Login
GET    /api/v1/auth/me             # Get current user [Auth]

GET    /api/v1/products            # List products (with ?category=&search=&page=)
GET    /api/v1/products/:id        # Get product detail
POST   /api/v1/products            # Create product [Admin]
PUT    /api/v1/products/:id        # Update product [Admin]
DELETE /api/v1/products/:id        # Delete product [Admin]

POST   /api/v1/orders              # Create order [Auth]
GET    /api/v1/orders              # List my orders [Auth]
GET    /api/v1/orders/:id          # Get order detail [Auth]
```

## 🐳 Docker Commands

```bash
# Build images
docker build -t ecommerce-backend ./backend
docker build -t ecommerce-frontend ./frontend

# Run with compose
docker compose up -d

# View logs
docker compose logs -f backend

# Database shell
docker exec -it ecommerce-db psql -U postgres -d ecommerce
```

## ☸️ Kubernetes Commands

```bash
# Deploy all
kubectl apply -f k8s/

# Check status
kubectl get all -n ecommerce

# Scale backend
kubectl scale deployment backend --replicas=5 -n ecommerce

# View logs
kubectl logs -f deployment/backend -n ecommerce
```

## 🌩️ AWS Deployment

```bash
# 1. Create EKS cluster
eksctl create cluster --name ecommerce --region ap-southeast-1 --nodegroup-name workers --node-type t3.medium --nodes 3

# 2. Push images to ECR
aws ecr create-repository --repository-name ecommerce-backend
docker tag ecommerce-backend:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/ecommerce-backend:latest
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/ecommerce-backend:latest

# 3. Deploy
kubectl apply -f k8s/
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | admin123 |
| User | Register via UI | - |

---

Built by [Your Name](https://github.com/yourname) — feel free to ⭐ this repo!
