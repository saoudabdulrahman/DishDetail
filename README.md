# DishDetail

DishDetail is a full-stack restaurant review application built with **React**, **Node.js**, **Express**, and **MongoDB**. It allows users to discover local restaurants, read community reviews, and share their own dining experiences.

## Project Structure

This project uses **npm Workspaces** to manage both the frontend and backend in a single repository:

- `client/`: React frontend (Vite, Tailwind CSS v4, React Router 7, Lucide Icons)
- `server/`: Express backend (Node.js, Mongoose, JWT-style auth simulation)
- `server/seed/`: Database seeding scripts and sample data

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (local instance or MongoDB Atlas)

## Initial Setup

### 1) Install Dependencies

From the root directory, run the following to install dependencies for all workspaces using npm:

```sh
npm install
```

### 2) Configure Environment Variables

**Server** — Create a `.env` file in the **server/** directory (or the root if running locally):

​`env
MONGODB_URI=mongodb://127.0.0.1:27017/dishdetail
PORT=3000
​`

**Client** — Copy `client/.env.example` to `client/.env`:

​`sh
cp client/.env.example client/.env
​`

The default value (`http://localhost:3000`) works for local development. Update it if your API runs on a different port or domain.

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

You can also run components separately:

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
- **Authentication**: User signup and login with persistent sessions.
- **Restaurant Discovery**: Search by name or filter by minimum rating.
- **Rich Reviews**: Star ratings, body text, and image support.
- **Social Interaction**: Vote reviews as "Helpful" or "Unhelpful" and leave comments.
- **Owner Responses**: Establishment owners can respond to customer feedback.
- **Deep Linking**: Direct navigation to specific reviews via hash fragments (e.g., `#/establishments/slug#review_id`).
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Layout Stability**: Implemented `scrollbar-gutter` and stable image placeholders to prevent layout shifting.

## Development Tools

- **Package Manager**: **npm**.
- **Formatting**: `npm run format` (Prettier)
- **Linting**: `npm run lint` (ESLint)
- **Git Hooks**: Pre-commit hooks via **Husky** and **lint-staged**.

---

## Resources & Credits

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Sonner](https://sonner.emilkowal.ski/)
- [Pravatar](https://pravatar.cc/) (Avatars)
- [Unsplash](https://unsplash.com/) (Photography)
