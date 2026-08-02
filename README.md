E-Commerce Platform

A full-stack e-commerce application for managing products, customers, carts, orders, payments, and inventory.

Features

- User authentication & authorization
- Product browsing, search & filtering
- Shopping cart & wishlist
- Checkout & payment integration
- Order management & tracking
- Inventory management
- Admin dashboard
- Payment webhooks
- Redis caching
- Background job processing
- API monitoring & logging

Tech Stack

Frontend: React, Next.js, TypeScript, Tailwind CSS

Backend: Node.js, NestJS, TypeScript

Database: PostgreSQL

Infrastructure: Docker, Redis, RabbitMQ

Observability: OpenTelemetry, Prometheus, Grafana

Architecture

Frontend
   ↓
API (NestJS)
   ↓
PostgreSQL
   ├── Redis
   ├── RabbitMQ → Workers
   └── Payment Provider

Getting Started

git clone <repository-url>
cd ecommerce
npm install
cp .env.example .env
docker compose up -d
npm run dev

API

POST   /api/v1/auth/login
GET    /api/v1/products
POST   /api/v1/cart/items
POST   /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/webhooks/payment

License

MIT
