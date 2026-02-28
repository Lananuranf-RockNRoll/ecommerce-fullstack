# ---- Build Stage ----
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go.mod first, run tidy to fetch all deps
COPY go.mod ./
RUN go mod download 2>/dev/null || true

COPY . .

# Build binary (go mod tidy fetches missing deps)
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/api

# ---- Run Stage ----
FROM alpine:3.19

WORKDIR /app

# Add CA certs for HTTPS calls
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./server"]
