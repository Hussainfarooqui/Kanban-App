import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0], // fallback if no name provided
      },
    });

    res.json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message || "Something went wrong" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

      // Debug logging: enabled when DEBUG_AUTH=true in env
      const debugAuth = process.env.DEBUG_AUTH === 'true';
      if (debugAuth) {
        try {
          console.log('[DEBUG] Login attempt for', email);
          // Avoid printing full password hashes in logs; just indicate length
          const pw = (user.password || '').toString();
          console.log('[DEBUG] Stored password hash length:', pw.length);
        } catch (dbg) {
          console.error('[DEBUG] unable to log user password metadata', dbg);
        }
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (debugAuth) console.log('[DEBUG] bcrypt.compare result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1d",
    });

    res.json({ access_token: token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message || "Something went wrong" });
  }
});

export default router;
