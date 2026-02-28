.PHONY: help dev prod build push k8s-deploy k8s-delete logs clean

# ─── Variables ──────────────────────────────────────────────
DOCKER_USER ?= yourname
IMAGE_TAG ?= latest
BACKEND_IMAGE = $(DOCKER_USER)/ecommerce-backend:$(IMAGE_TAG)
FRONTEND_IMAGE = $(DOCKER_USER)/ecommerce-frontend:$(IMAGE_TAG)

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Development ────────────────────────────────────────────
dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up --build

dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml down

# ─── Production (Docker Compose) ────────────────────────────
prod: ## Start production with docker compose
	docker compose up --build -d

prod-down: ## Stop production
	docker compose down

logs: ## Show all logs
	docker compose logs -f

# ─── Build & Push Images ────────────────────────────────────
build: ## Build Docker images
	docker build -t $(BACKEND_IMAGE) ./backend
	docker build -t $(FRONTEND_IMAGE) ./frontend
	@echo "✅ Images built"

push: build ## Push images to Docker Hub
	docker push $(BACKEND_IMAGE)
	docker push $(FRONTEND_IMAGE)
	@echo "✅ Images pushed"

# ─── Kubernetes ─────────────────────────────────────────────
k8s-deploy: ## Deploy to Kubernetes
	kubectl apply -f k8s/
	@echo "✅ Deployed to Kubernetes"
	@echo ""
	@echo "Waiting for pods..."
	kubectl rollout status deployment/backend -n ecommerce
	kubectl rollout status deployment/frontend -n ecommerce

k8s-delete: ## Delete all Kubernetes resources
	kubectl delete -f k8s/

k8s-status: ## Show Kubernetes status
	kubectl get all -n ecommerce

k8s-logs-backend: ## Show backend pod logs
	kubectl logs -f deployment/backend -n ecommerce

k8s-port-forward: ## Port forward for local testing
	kubectl port-forward svc/frontend-service 3000:80 -n ecommerce &
	kubectl port-forward svc/backend-service 8080:8080 -n ecommerce &

# ─── Minikube ───────────────────────────────────────────────
minikube-start: ## Start minikube cluster
	minikube start --driver=docker --cpus=4 --memory=4096
	minikube addons enable ingress
	@echo "✅ Minikube started"

minikube-image-load: build ## Load images into minikube
	minikube image load $(BACKEND_IMAGE)
	minikube image load $(FRONTEND_IMAGE)
	@echo "✅ Images loaded into minikube"

# ─── Database ───────────────────────────────────────────────
db-migrate: ## Run migrations locally
	psql -h localhost -U postgres -d ecommerce -f backend/migrations/001_init.sql

db-shell: ## Open postgres shell
	docker exec -it ecommerce-db psql -U postgres -d ecommerce

# ─── Cleanup ────────────────────────────────────────────────
clean: ## Remove all containers and volumes
	docker compose down -v --remove-orphans
	docker system prune -f
