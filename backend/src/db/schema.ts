import { pgTable, uuid, varchar, boolean } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  content: varchar("content", { length: 1024 }).notNull(),
  completed: boolean("completed").default(false),
  heading: varchar("heading", { length: 256 }),
});

type Task = {
  id: string;
  heading: string;
  content: string;
  completed: boolean;
  category?: string; 
};

