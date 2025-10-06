import express from "express";
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { authenticateJWT } from "./middlewares/authMiddleware.js"; 

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);

app.use("/auth", authRoutes);

app.use("/users", authenticateJWT, userRoutes);
app.use("/resources", authenticateJWT, resourceRoutes);
app.use("/tasks", authenticateJWT, taskRoutes);


app.get("/me", authenticateJWT, (req, res) => res.json({ user: req.user }));

app.get('/test', (req, res) => {
  res.json({ status: 'OK' });
});


export default app;
