# DishDetail

Restaurant review web app (React + Node.js + MongoDB).

## Project Structure

This project is organized as a monorepo with separate directories for the frontend and backend:

- `client/`: React frontend (Vite)
- `server/`: Express backend (Node.js + Mongoose)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)
- MongoDB (local install or MongoDB Atlas)

## Initial Setup

### 1) Install dependencies

Install dependencies for the root, client, and server:

```sh
npm run install
```

### 2) Configure Environment Variables

Create a `.env` file in the **root** of the project and add your database configuration:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/dishdetail
PORT=3000
```

_(If you are using MongoDB Atlas, replace the URI with your Atlas connection string)._

### 3) Seed the Database

Populate the database with sample establishments, users, and reviews:

```sh
npm run seed
```

---

## Running the Application

### Development Mode (Recommended)

This mode runs the Vite frontend development server and the Node.js backend server simultaneously from the root directory.

```sh
npm run dev
```

- **Frontend**: `http://localhost:5173` (with hot-reloading)
- **Backend API**: `http://localhost:3000`
- API requests are automatically proxied from the frontend to the backend.

### Running Separately

If you prefer to run them in separate terminals:

**To run the Backend only:**

```sh
npm run dev:server
```

**To run the Frontend only:**

```sh
npm run dev:client
```

---

## Resources Used

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [slugify](https://www.npmjs.com/package/slugify)
- [Lucide](https://lucide.dev/)
- [Simple Icons](https://simpleicons.org/)
- [Pravatar](https://pravatar.cc/)
- [Unsplash](https://unsplash.com/)
