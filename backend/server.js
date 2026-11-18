require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sql, poolPromise } = require("./db");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

const PORT = process.nextTick.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
