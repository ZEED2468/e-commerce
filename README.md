E-Commerce Platform

A modern full-stack e-commerce platform that allows customers to discover products, manage their carts, place orders, and make payments, while providing administrators with tools to manage products, inventory, and orders.

Features

Customer

- User registration and authentication
- Browse and search products
- Product categories and filtering
- Add and manage cart items
- Wishlist
- Checkout and payment
- Order history and tracking
- Product reviews

Admin

- Product and category management
- Inventory management
- Order management
- Customer management
- Sales overview

Backend & Infrastructure

- JWT authentication and role-based authorization
- RESTful API
- PostgreSQL database
- Redis caching
- RabbitMQ background jobs
- Payment webhooks
- Idempotent order and payment processing
- Structured logging and monitoring
- Dockerized development environment

Tech Stack

Layer| Technology
Frontend| React, Next.js, TypeScript, Tailwind CSS
Backend| Node.js, NestJS, TypeScript
Database| PostgreSQL
Cache| Redis
Message Broker| RabbitMQ
Infrastructure| Docker
Monitoring| OpenTelemetry, Prometheus, Grafana
Payments| Payment Provider API

Architecture

                 ┌──────────────┐
                 │   Frontend   │
                 │ React/Next.js│
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  NestJS API  │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     PostgreSQL       Redis       RabbitMQ
                                      │
                                      ▼
                                   Workers
                                      │
                                      ▼
                              Notifications

Core Workflow

Customer
   ↓
Browse Products
   ↓
Add to Cart
   ↓
Checkout
   ↓
Create Order
   ↓
Process Payment
   ↓
Payment Webhook
   ↓
Confirm Order
   ↓
Update Inventory
   ↓
Send Notification

Payment and order operations are designed to be idempotent, preventing duplicate orders when requests or webhook events are retried.

API Structure

/api/v1/auth
/api/v1/products
/api/v1/categories
/api/v1/cart
/api/v1/orders
/api/v1/payments
/api/v1/inventory
/api/v1/webhooks

Getting Started

Requirements

- Node.js
- Docker
- Docker Compose

Installation

git clone <repository-url>
cd ecommerce

npm install

cp .env.example .env

docker compose up -d

npm run dev

Environment Variables

DATABASE_URL=
REDIS_URL=
RABBITMQ_URL=
JWT_SECRET=
PAYMENT_SECRET=

Testing

The project includes:

- Unit tests for business logic
- Integration tests for database and infrastructure
- End-to-end tests for critical customer workflows

Example:

npm run test
npm run test:e2e

Observability

The application tracks important system metrics such as:

- API response time
- Error rates
- Database performance
- Queue processing
- Cache performance
- Payment and order processing

OpenTelemetry, Prometheus, and Grafana are used to provide application visibility.

Project Goals

This project demonstrates practical experience with:

- Full-stack application development
- REST API design
- Database design and transactions
- Authentication and authorization
- Caching
- Asynchronous processing
- Message queues
- Payment integration
- Webhooks
- Concurrency and idempotency
- Observability
- Docker and deployment
- Scalable backend architecture

License

MIT
