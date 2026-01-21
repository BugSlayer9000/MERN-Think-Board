// HTTP methods

// 1. GET - get some post on instergram
// 2. POST - Create a post on insta
// 3. PUT - Update a post
// 4. Delete - Delete a post

// HTTP status codes

// 1xx - Information
// 2xx - sucess
// 200 - OK
// 201 - Created
// 3xx - Redirector
// 4xx - Client Errors
// 400 - Bad request - The req is malformed or invalid
// 401 - Unauthorized - You must log in(missing ot invalid credentials)
// 403 - Forbidden - You are not allowed to acess this
// 404 - Not found - The URL doesn't exist

// 429 - too many reqs
// 5xx - Server Error

// What is an endpoint
// An endpoint is a combination of a URL + HTTP method that lets the client interact with a specific resourse

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    }),
  );
}
app.use(express.json());
app.use(ratelimiter);

app.use("/api/notes", notesRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("server started port", PORT);
  });
});
