import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/board";

dotenv.config();

const app = express();

// Enable CORS for frontend communication
// In development allow the requesting origin (safer than hard-coding) so Vite/localhost variants work
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like curl, native clients)
    if (!origin) return callback(null, true);
    // Allow all origins in development; if you want to lock down, set FRONTEND_URL in .env
    const allowed = process.env.FRONTEND_URL || true;
    return callback(null, allowed);
  },
  credentials: true
}));

// Simple request logger to aid debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);

// Add a route to get current user info
app.get("/users/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/", (req, res) => {
  res.send("Kanban backend running!");
});

// global error handler - returns error message (development-friendly)
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  const safeMessage = err?.message || 'Internal Server Error';
  res.status(err?.status || 500).json({ error: safeMessage, stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack });
});

const PORT = Number(process.env.PORT || 3000);
// Bind to 0.0.0.0 to ensure the server listens on IPv4 loopback and all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
