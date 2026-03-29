# DishDetail

DishDetail is a full-stack restaurant review application built with **TypeScript**, **React**, **Node.js**, **Express**, and **MongoDB**. It allows users to discover local restaurants, read community reviews, and share their own dining experiences.

## Project Structure

This project uses **npm Workspaces** to manage the frontend, backend, and shared code in a single repository:

- `client/`: React frontend (**Vite 8**, TypeScript, React Router 7, Lucide Icons)
- `server/`: Express backend (**Node.js**, **TypeScript**, Mongoose, JWT-style auth simulation)
- `shared/`: Shared **TypeScript** types and utilities used by both client and server
- `server/seed/`: Database seeding scripts and sample data (using `tsx`)

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/) (v10 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (local instance or MongoDB Atlas)

## Initial Setup

### 1) Install Dependencies

From the root directory, run the following to install dependencies for all workspaces:

```sh
npm install
```

### 2) Configure Environment Variables

Create a `.env` file in the **server/** directory (to be used by the backend workspace) with your configuration:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/dishdetail
PORT=3000
```

### 3) Seed the Database

Populate the database with sample establishments and reviews:

```sh
npm run seed
```

---

## Running the Application

### Development Mode

Run the entire stack simultaneously using the root development script:

```sh
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

### Individual Workspaces

You can also run components separately using workspace commands:

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

- **TypeScript End-to-End**: Type safety across the entire stack using the shared workspace.
- **Authentication**: User signup and login with persistent sessions.
- **Restaurant Discovery**: Search by name or filter by minimum rating.
- **Rich Reviews**: Star ratings, body text, and image support.
- **Social Interaction**: Vote reviews as "Helpful" or "Unhelpful" and leave comments.
- **Owner Responses**: Establishment owners can respond to customer feedback.
- **Deep Linking**: Direct navigation to specific reviews via hash fragments.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Modern Tooling**: Powered by Vite 8 and tsx for a fast development experience.

## Development Tools

- **Formatting**: `npm run format` (Prettier)
- **Linting**: `npm run lint` (ESLint)
- **Shared Types**: Check `shared/` for common interfaces.
- **Git Hooks**: Pre-commit hooks via **Husky** and **lint-staged**.

---

## Resources & Credits

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Sonner](https://sonner.emilkowal.ski/)
- [Pravatar](https://pravatar.cc/) (Avatars)
- [Unsplash](https://unsplash.com/) (Photography)
