# Hono API Starter

## Description:
This starter rest api is built with Typescript, prisma, and Hono. It provides a simple structure to get you started with building RESTful APIs.
It includes authentication with email and password, JWT token generation, and basic user management.

## Features:
- User registration and login
- JWT token authentication
- Basic user management (CRUD operations)
- Prisma ORM for database interactions
- Hono framework for building APIs

## Routes:
- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/refresh`: Refresh JWT tokens(access and refresh tokens)

## Get Started
To install dependencies:
```sh
bun install
```

To run:
```sh
bun dev
```

open http://localhost:3000/api/v1/
