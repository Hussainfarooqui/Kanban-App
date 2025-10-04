import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create or reuse an admin user (idempotent)
  // Ensure admin user exists and always set a known hashed password for development
  const plainPassword = "password123";
  const hashed = await bcrypt.hash(plainPassword, 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: hashed, name: "Admin User" },
    create: { email: "admin@example.com", password: hashed, name: "Admin User" }
  });

  // Create a board owned by the admin
  const board = await prisma.board.create({
    data: {
      name: "Project Alpha",
      ownerId: user.id,
    },
  });

  // Create a few columns
  const todo = await prisma.column.create({
    data: {
      title: "To Do",
      boardId: board.id,
    },
  });

  const inProgress = await prisma.column.create({
    data: {
      title: "In Progress",
      boardId: board.id,
    },
  });

  const done = await prisma.column.create({
    data: {
      title: "Done",
      boardId: board.id,
    },
  });

  // Add tasks to "To Do"
  await prisma.task.createMany({
    data: [
      {
        title: "Set up project repo",
        status: "todo",
        columnId: todo.id,
      },
      {
        title: "Define schema",
        status: "todo",
        columnId: todo.id,
      },
    ],
  });

  // Add a task to "In Progress"
  await prisma.task.create({
    data: {
      title: "Build auth system",
      status: "in-progress",
      columnId: inProgress.id,
    },
  });
}

main()
  .then(async () => {
    console.log("✅ Database seeded successfully!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
