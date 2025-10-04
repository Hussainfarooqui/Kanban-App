import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
// Protect all board routes - user must be authenticated
router.use(authMiddleware as any);
const prisma = new PrismaClient();

// Get all boards with columns + tasks
router.get("/", async (req: any, res) => {
  try {
    // Only return boards owned by the authenticated user
    const userId = req.user?.userId;
    const boards = await prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        columns: {
          include: { tasks: true },
        },
      },
    });
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message || "Something went wrong" });
  }
});

// Create a new board
router.post("/", async (req: any, res) => {
  try {
    const { name } = req.body;
    const ownerId = req.user?.userId;

    if (!name || !ownerId) {
      return res.status(400).json({ error: "Board name and authenticated owner are required" });
    }

    const board = await prisma.board.create({ data: { name, ownerId } });

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message || "Something went wrong" });
  }
});

// Get a single board
router.get("/:id", async (req: any, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!board) return res.status(404).json({ error: "Board not found" });
    // Verify ownership
    const userId = req.user?.userId;
    if (board.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message || "Something went wrong" });
  }
});

// Create a new column
router.post("/:boardId/columns", async (req: any, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;
    const userId = req.user?.userId;

    if (!title) return res.status(400).json({ error: "Column title is required" });

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return res.status(404).json({ error: "Board not found" });
    if (board.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const column = await prisma.column.create({ data: { title, boardId } });
    res.json(column);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message || "Something went wrong" });
  }
});

// Create a new task
router.post("/:boardId/columns/:columnId/tasks", async (req: any, res) => {
  try {
    const { boardId, columnId } = req.params;
    const { title, status } = req.body;
    const userId = req.user?.userId;

    if (!title) return res.status(400).json({ error: "Task title is required" });

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return res.status(404).json({ error: "Board not found" });
    if (board.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const column = await prisma.column.findUnique({ where: { id: columnId } });
    if (!column || column.boardId !== boardId) return res.status(404).json({ error: "Column not found" });

    const task = await prisma.task.create({ data: { title, status: status || "todo", columnId } });
    console.log(`Created task ${task.id} in column ${columnId}`);
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message || "Something went wrong" });
  }
});

// Update task status (move between columns)
router.put("/tasks/:taskId", async (req: any, res) => {
  try {
    const { taskId } = req.params;
    const { columnId, status } = req.body;
    // Verify ownership: ensure the board owning the task belongs to the user
    const userId = req.user?.userId;
    const existing = await prisma.task.findUnique({ where: { id: taskId }, include: { column: true } });
    if (!existing) return res.status(404).json({ error: "Task not found" });
    const board = await prisma.board.findUnique({ where: { id: existing.column.boardId } });
    if (!board || board.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    const task = await prisma.task.update({ where: { id: taskId }, data: { columnId, status } });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete a task
router.delete("/tasks/:taskId", async (req: any, res) => {
  try {
    const { taskId } = req.params;
    // Verify ownership
    const userId = req.user?.userId;
    const existing = await prisma.task.findUnique({ where: { id: taskId }, include: { column: true } });
    if (!existing) return res.status(404).json({ error: "Task not found" });
    const board = await prisma.board.findUnique({ where: { id: existing.column.boardId } });
    if (!board || board.ownerId !== userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
