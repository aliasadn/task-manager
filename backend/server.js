require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { poolPromis } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

const PORT = process.nextTick.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
