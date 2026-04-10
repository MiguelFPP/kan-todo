# Kan-Todo: Senior Monorepo Template

Kan-Todo is a high-performance, type-safe task management system built with a **Screaming Architecture**. It serves as a robust foundation for scalable full-stack applications, emphasizing separation of concerns and developer experience.

## 🌟 Why this is a great template for future projects?

This skeleton isn't just a project; it's a **Master Template** designed for long-term maintainability:

1.  **Hexagonal Architecture (Backend):** Business logic is decoupled from the framework. Switching databases or storage providers requires zero changes to core use cases.
2.  **Single Source of Truth (SSOT):** Shared Zod schemas in `packages/types` ensure that the Frontend and Backend are always in sync. If a type changes, TypeScript will flag errors across the entire monorepo.
3.  **LocalStack Integration:** Develop and test cloud features (like S3 file uploads) locally without an AWS account or costs.
4.  **Turborepo Orchestration:** Advanced build caching and task pipelines for a lightning-fast development cycle.
5.  **Senior Standards:** Strict TypeScript mode, conventional commits ready, and containerized infrastructure from day one.
6.  **Full Dockerization (New):** Develop the entire stack (API, Web, DB, S3) inside containers using **Node 25 (Debian)** for a consistent environment across any machine.

---

## 📂 Project Structure

```plaintext
/kan-todo
├── apps/
│   ├── api/                # NestJS Backend (Hexagonal Architecture)
│   └── web/                # Next.js Frontend (App Router)
├── packages/
│   ├── types/              # Shared Zod Schemas & TypeScript Types
│   └── config/             # Shared ESLint, Tailwind, and TSConfig
├── docs/                   # Technical documentation
├── docker-compose.yml      # Infrastructure + App Orchestration
├── turbo.json              # Monorepo task runner
└── package.json            # Workspace configuration
```

---

## 🛠️ Tech Stack

-   **Monorepo:** Turborepo + NPM Workspaces.
-   **Frontend:** Next.js 14+ (App Router) + Tailwind CSS + Lucide Icons.
-   **Backend:** NestJS + Prisma ORM (PostgreSQL).
-   **Infrastructure:** Docker Compose + **LocalStack 3.0 (S3)**.
-   **Validation:** Zod (Shared between layers).

---

## 🐳 Full Monorepo Dockerization

The project is fully containerized for development. This is the recommended way to run the project if you want to avoid installing specific Node versions or tools locally.

### 1. Start everything
```bash
docker compose up --build
```
This will build the API and Web images (Node 25), install all dependencies, generate the Prisma client, and start PostgreSQL and LocalStack. **Hot Reload** is enabled via volumes.

### 2. Useful Docker Commands

**Service Management:**
- **Stop all:** `docker compose down`
- **View logs:** `docker compose logs -f`
- **Restart API:** `docker compose restart api`

**Prisma & Database:**
Run these while the containers are up:
- **Generate Prisma Client:** `docker exec -it kan-todo-api npx prisma generate`
- **Push DB Schema:** `docker exec -it kan-todo-api npx prisma db push`
- **Prisma Studio:** `docker exec -it kan-todo-api npx prisma studio` (Go to http://localhost:5555)

---

## ☁️ LocalStack & AWS CLI

We use **LocalStack 3.0** to emulate AWS services locally. This specific version is used because it doesn't require API keys or OAuth for basic services like S3, making it ideal for a seamless developer experience.

### 1. Install AWS CLI
To interact with LocalStack, you'll need the AWS CLI installed:

```bash
# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure with dummy data (LocalStack ignores these but AWS CLI needs them)
aws configure
# AWS Access Key ID [None]: test
# AWS Secret Access Key [None]: test
# Default region name [None]: us-east-1
# Default output format [None]: json
```

### 2. S3 Cheat Sheet (using `awslocal`)
We recommend using the `awslocal` wrapper (install via `pip install awscli-local`) or using the `--endpoint-url` flag with the standard AWS CLI.

**Using standard AWS CLI:**
```bash
# Create a bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://kan-todo-bucket

# List buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# Upload a file
aws --endpoint-url=http://localhost:4566 s3 cp myfile.txt s3://kan-todo-bucket/

# List files in a bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://kan-todo-bucket --recursive

# Delete a file
aws --endpoint-url=http://localhost:4566 s3 rm s3://kan-todo-bucket/myfile.txt
```

---

## 🚀 Quick Start (Local Node.js)

If you prefer to run Node.js on your host machine:

### 1. Prerequisites
-   **Docker** and **Node.js 20+** installed.

### 2. Infrastructure
Run the following in the root directory to start PostgreSQL and LocalStack (S3):
```bash
docker compose up -d postgres localstack
```

### 3. Installation
Install dependencies for all packages:
```bash
npm install
```

### 4. Development
Start all services (API, Web, and Types watcher) in parallel:
```bash
npm run dev
```

---

## 🔗 Useful Links
-   **Frontend:** [http://localhost:3000](http://localhost:3000)
-   **API Documentation (Swagger):** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
-   **API Health:** [http://localhost:4000/health](http://localhost:4000/health)
