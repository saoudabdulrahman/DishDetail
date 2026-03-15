# DishDetail

Restaurant review web app (React + Node.js + MongoDB).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)
- MongoDB (local install or MongoDB Atlas)

## Initial Setup

### 1) Install dependencies

```sh
npm install
```

### 2) Configure Environment Variables

Create a `.env` file in the root of the project and add your database configuration:

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

There are two ways to run the application depending on your needs: **Development Mode** (recommended for coding) and **Production Mode**.

### Option A: Development Mode (Hot-Reloading)

This mode runs the Vite frontend development server and the Node.js backend server simultaneously. It supports hot-reloading for frontend changes.

1. **Start the backend server** (in one terminal terminal):

   ```sh
   npm start
   ```

   _The backend will run on `http://localhost:3000`._

2. **Start the Vite frontend dev server** (in a second terminal):

   ```sh
   npm run dev
   ```

   _Vite will automatically open the app or provide a local URL (usually `http://localhost:5173`). API requests are automatically proxied to the backend._

### Option B: Production Mode

This mode builds the optimized React frontend and serves it directly through the Node.js Express backend.

1. **Build the React app**:

   ```sh
   npm run build
   ```

2. **Start the Node server**:

   ```sh
   npm start
   ```

3. Open your browser and navigate to: **`http://localhost:3000`**

---

## Resources Used

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Google Fonts](https://fonts.google.com/)
- [Lucide](https://lucide.dev/)
- [Simple Icons](https://simpleicons.org/)
- [Pravatar](https://pravatar.cc/)
- [Unsplash](https://unsplash.com/)
