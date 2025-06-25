import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tasksRouter from "./routes/tasks";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("Backend Works"));
app.use("/api/tasks", tasksRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));