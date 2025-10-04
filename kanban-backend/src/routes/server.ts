import express from "express";
import dotenv from "dotenv";
import authRoutes from "../routes/auth";
import boardRoutes from "../routes/board";

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
