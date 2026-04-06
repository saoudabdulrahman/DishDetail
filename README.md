# DishDetail

DishDetail is a full-stack restaurant review application built with **React 19**, **Node.js**, **Express 5**, and **MongoDB**. It allows users to discover local restaurants, read community reviews, share their own dining experiences, and manage personal profiles.

## Project Structure

This project uses **npm Workspaces** to manage both the frontend and backend in a single repository:

- `client/`: React frontend (Vite 8, Tailwind CSS v4, React Router 7, Headless UI, Lucide Icons)
- `server/`: Express 5 backend (Node.js, Mongoose 9, JWT-Bearer authentication)
- `server/seed/`: Database seeding scripts and sample data

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) (v10 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (local instance or MongoDB Atlas)

## Initial Setup

### 1) Install Dependencies

From the root directory, run the following to install dependencies for all workspaces using npm:

```sh
npm install
```

### 2) Configure Environment Variables

**Server** — Follow the instructions in `server/.env.example`

**Client** — Copy `client/.env.example` to `client/.env`:

```sh
cp client/.env.example client/.env
```

The default value (`http://localhost:3000`) works for local development.

### 3) Seed the Database

Populate the database with sample establishments and reviews:

```sh
npm run seed
```

---

## Running the Application

### Development Mode

Run both the frontend and backend simultaneously using the root development script:

```sh
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

### Individual Workspaces

**Backend Server:**

```sh
npm run dev:server
```

**Frontend Client:**

```sh
npm run dev:client
```

---

## Key Features

- **Styling**: Modern, utility-first UI built with **Tailwind CSS v4**.
- **Accessible Components**: Interactive UI built with **Headless UI** primitives.
- **Authentication**: JWT-based authentication using **Bearer tokens** in the Authorization header.
- **Validation**: End-to-end type safety using **Zod** schemas.
- **User Profiles**: View and edit personal profiles via `/profile/:username` routes.
- **Restaurant Discovery**: Search by name or filter by cuisine and minimum rating.
- **Rich Reviews**: Star ratings, body text, and support for image uploads.
- **Social Interaction**: Vote reviews as "Helpful" or "Unhelpful".
- **Performance**: Route-level **code splitting** and **dynamic imports** for faster page loads.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Layout Stability**: Optimized with `scrollbar-gutter` and stable image placeholders.

## Security & Observability

- **Structured Logging**: Uses [**Pino**](https://getpino.io/) for efficient, JSON-based logging with human-readable output in development via `pino-pretty`.
- **HTTP Security Headers**: [`helmet`](https://helmetjs.github.io/) is applied globally.
- **Auth Rate Limiting**: [`express-rate-limit`](https://github.com/express-rate-limit/express-rate-limit) restricts `/api/auth` endpoints.
- **Image Upload Pipeline**: Uses `multer` with **Cloudinary** for media upload and delivery.
- **Graceful Shutdown**: The server listens for `SIGTERM` and `SIGINT` signals for clean exits.

## Development Tools

- **Formatting**: `npm run format` (Prettier)
- **Linting**: `npm run lint` (ESLint)
- **Testing**: `npm run test` (Vitest — uses **happy-dom** for fast client-side tests).
- **Git Hooks**: Pre-commit hooks via **Husky** and **lint-staged**.
