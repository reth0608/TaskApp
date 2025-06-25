import express, { Request, Response } from "express";
import { getTasks } from "../utils/gemini";
import { db } from "../db/client";
import { tasks as tasksTable } from "../db/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
    res.json({ tasks: allTasks });
  } catch (err) {
    console.error("Fetch tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});


router.post("/", async (req: Request, res: Response) => {
  try {
    const { topic, userId = "anonymous" } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const taskList = await getTasks(topic);

    const inserted = await db.insert(tasksTable).values(
      taskList.map((task: string) => ({
        userId,
        content: task,
        completed: false,
        heading: topic,
      }))
    ).returning();

    res.json({ tasks: inserted });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to generate tasks" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Invalid completed status" });
    }

    const updated = await db
      .update(tasksTable)
      .set({ completed })
      .where(eq(tasksTable.id, taskId))
      .returning();

    res.json({ task: updated[0] });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

export default router;