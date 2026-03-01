# DishDetail

Restaurant review web app (React + Node.js + MongoDB).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)
- MongoDB (local install or Atlas)

## Running locally (Phase 2 backend)

### 1) Install dependencies

```sh
npm install
```

### 2) Configure MongoDB

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/dishdetail
PORT=3000
```

If you use MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string.

### 3) Seed sample data

```sh
npm run seed
```

### 4) Build the React app

```sh
npm run build
```

### 5) Run the Node server

```sh
npm start
```

Open: `http://localhost:3000`

### Optional: Vite dev mode

You can still run the frontend dev server (API calls will hit the same origin only if you proxy).
For Phase 2 submission, use `npm run build` + `npm start`.

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
