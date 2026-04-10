# Kan-Todo Web

The user interface for Kan-Todo, built with **Next.js 14** using the **App Router** and **React Server Components**.

## 🎨 Tech Stack

-   **Framework:** Next.js 14.
-   **Styling:** Tailwind CSS.
-   **Icons:** Lucide React.
-   **Types:** Consumes shared types from `@kan-todo/types`.
-   **Validation:** Zod for client-side and form validation.

## 🏗️ Patterns

-   **App Router:** File-system based routing with support for layouts and loading states.
-   **Server Components:** Fetches data on the server by default for maximum performance.
-   **Atomic Design (Pending):** Components organized for reuse.

## 🚀 Development

### Commands
-   `npm run dev`: Start the Next.js development server on [http://localhost:3000](http://localhost:3000).
-   `npm run build`: Build the application for production.
-   `npm run lint`: Run ESLint to check for code quality issues.

## 🔗 Integration
The frontend is configured to communicate with the Backend API on port `4000`. Ensure the API is running before performing data-intensive tasks.
