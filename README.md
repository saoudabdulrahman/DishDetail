# DishDetail

DishDetail is a full-stack restaurant review platform built with **React 19**, **Express 5**, and **MongoDB** in an **npm Workspaces** monorepo.

It lets users browse establishments, publish reviews, vote review quality, and manage public profiles.

## Project Structure

- `client/` - React 19 + Vite 8 frontend (React Router 7, Tailwind CSS v4, TanStack Query)
- `server/` - Express 5 API (Mongoose 9, JWT auth, Zod validation, Pino logging)
- `server/seed/` - seed scripts for sample establishments/reviews/users

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+
- [MongoDB](https://www.mongodb.com/try/download/community) local instance or Atlas

## Setup

### 1) Install dependencies

```sh
npm install
```

### 2) Configure environment variables

Server: copy `server/.env.example` to `server/.env` and fill values.

Client: copy `client/.env.example` to `client/.env`.

`VITE_API_BASE_URL` defaults to `http://localhost:3000` for local development.

### 3) Seed local data (optional, recommended)

```sh
npm run seed
```

## Run the app

```sh
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

Run one workspace at a time:

```sh
npm run dev:client
npm run dev:server
```

## Available root scripts

- `npm run dev` - run client + server in parallel
- `npm run build` - build all workspaces
- `npm run lint` - lint all workspaces
- `npm run test` - run all workspace tests
- `npm run format` / `npm run format:check` - prettier write/check
- `npm run seed` - seed database from server workspace
- `npm run test:watch:client` / `npm run test:watch:server` - workspace watch mode

## Current product capabilities

- Establishment discovery with search, cuisine filter, minimum rating filter, and pagination
- Review feed with search, cuisine filtering, and pagination
- Homepage with featured spotlight, latest critiques (sorting by Recent, Highest, Trending), and popular taste/top critic sidebars
- Establishment detail pages with associated reviews
- Authenticated review creation, editing, and deletion
- Review voting (`helpful` / `unhelpful`) with duplicate-vote protection
- Image upload support for reviews through Cloudinary
- Public profile pages at `/profile/:username`
- Authenticated profile updates (`avatar`, `bio`)
- Route-level lazy loading for major pages

## API overview

- `/api/health`
- `/api/auth` (`signup`, `login`, `logout`, `me`)
- `/api/users` (read by id/username, update own profile)
- `/api/establishments` (list/detail/create review)
- `/api/reviews` (list/update/delete/vote)
- `/api/upload` (authenticated image upload)

## Security and runtime notes

- JWT bearer-token auth (`Authorization: Bearer <token>`)
- Password hashing with `bcryptjs` (10 rounds)
- `helmet` for security headers (including Cloudinary image CSP allowance)
- `express-rate-limit` on auth routes
- Structured logging with `pino` + `pino-http` (`pino-pretty` in local dev)
- Graceful shutdown on `SIGTERM`/`SIGINT`

## Tooling and tests

- ESLint + Prettier
- Husky + lint-staged pre-commit checks
- Vitest in both workspaces
- `happy-dom`, Testing Library, and MSW for client tests
- Supertest for server route tests
