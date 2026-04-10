# Kan-Todo API

The backend core of the Kan-Todo ecosystem, built with **NestJS** and following **Hexagonal Architecture** (Ports & Adapters) and **DDD** principles.

## 🏗️ Architecture Layers

-   **`src/core`**: The heart of the application. Contains Entities, Use Cases, and Port interfaces. **Dependency Rule:** This layer cannot import anything from `infra`, `web`, or `@nestjs`.
-   **`src/infra`**: Concrete implementations of adapters (Prisma, S3, etc.).
-   **`src/web`**: Entry points. Controllers, DTOs, and framework-specific logic.

## 🛠️ Features

-   **Type-Safe Database:** PostgreSQL with Prisma ORM.
-   **Cloud Native Storage:** AWS SDK v3 configured for **LocalStack 3.0** (S3) in development. We use this version to avoid API Key/OAuth requirements.
-   **Health Monitoring:** Integrated health check for DB and S3 connections.
-   **Swagger UI:** Automatic OpenAPI documentation.

---

## ☁️ LocalStack S3 Cheat Sheet

To interact with the local S3 service, you can use the AWS CLI with the local endpoint:

```bash
# Alias recommendation (add to .bashrc or .zshrc)
alias awslocal='aws --endpoint-url=http://localhost:4566'

# Essential commands:
awslocal s3 ls                         # List all buckets
awslocal s3 mb s3://kan-todo-bucket    # Create the app bucket
awslocal s3 ls s3://kan-todo-bucket    # List files in the bucket
awslocal s3 cp test.jpg s3://kan-todo/ # Upload a file
```

---

## 🚀 Development

### Environment Variables
Ensure the `.env` file exists with the following:
```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/kan_todo?schema=public"
S3_ENDPOINT="http://localhost:4566"
```

### Commands
-   `npm run dev`: Start NestJS in watch mode.
-   `npx prisma studio`: Open the database GUI.
-   `npx prisma db push`: Sync the schema with the local DB.

## 📝 API Endpoints
-   `GET /health`: Checks connectivity with PostgreSQL and S3.
-   `GET /api/docs`: Access Swagger documentation.
