# Kan-Todo: Senior Monorepo Template

Kan-Todo is a high-performance, type-safe task management system built with a **Screaming Architecture**. It serves as a robust foundation for scalable full-stack applications, emphasizing separation of concerns and developer experience.

## 🌟 Why this is a great template for future projects?

This skeleton isn't just a project; it's a **Master Template** designed for long-term maintainability:

1.  **Hexagonal Architecture (Backend):** Business logic is decoupled from the framework. Switching databases or storage providers requires zero changes to core use cases.
2.  **Single Source of Truth (SSOT):** Shared Zod schemas in `packages/types` ensure that the Frontend and Backend are always in sync. If a type changes, TypeScript will flag errors across the entire monorepo.
3.  **LocalStack Integration:** Develop and test cloud features (like S3 file uploads) locally without an AWS account or costs.
4.  **Turborepo Orchestration:** Advanced build caching and task pipelines for a lightning-fast development cycle.
5.  **Senior Standards:** Strict TypeScript mode, conventional commits ready, and containerized infrastructure from day one.

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
├── docker-compose.yml      # Infrastructure (Postgres + LocalStack)
├── turbo.json              # Monorepo task runner
└── package.json            # Workspace configuration
```

---

## 🛠️ Tech Stack

-   **Monorepo:** Turborepo + NPM Workspaces.
-   **Frontend:** Next.js 14+ (App Router) + Tailwind CSS + Lucide Icons.
-   **Backend:** NestJS + Prisma ORM (PostgreSQL).
-   **Infrastructure:** Docker Compose + LocalStack (S3).
-   **Validation:** Zod (Shared between layers).

---

## 🚀 Quick Start

### 1. Prerequisites
-   **Docker** and **Node.js 20+** installed.

### 2. Infrastructure
Run the following in the root directory to start PostgreSQL and LocalStack (S3):
```bash
docker compose up -d
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
