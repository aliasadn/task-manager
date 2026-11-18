const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// همه‌ی مسیرهای این فایل نیاز به توکن دارن
router.use(authMiddleware);

// لیست وظیفه‌ها
router.get("/", async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool
      .request()
      .input("userId", db.sql.Int, req.userId)
      .query(
        "SELECT Id, Title, Description, IsDone, CreatedAt FROM Tasks WHERE UserId = @userId ORDER BY CreatedAt DESC",
      );
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ساخت وظیفه
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const pool = await db.poolPromise;
    const result = await pool
      .request()
      .input("userId", db.sql.Int, req.userId)
      .input("title", db.sql.NVarChar, title)
      .input("description", db.sql.NVarChar, description || null)
      .query(
        "INSERT INTO Tasks (UserId, Title, Description) OUTPUT INSERTED.* VALUES (@userId, @title, @description)",
      );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ویرایش وظیفه
router.put("/:id", async (req, res) => {
  try {
    const { title, description, isDone } = req.body;

    const pool = await db.poolPromise;
    const result = await pool
      .request()
      .input("id", db.sql.Int, req.params.id)
      .input("userId", db.sql.Int, req.userId)
      .input("title", db.sql.NVarChar, title ?? null)
      .input("description", db.sql.NVarChar, description ?? null)
      .input("isDone", db.sql.Bit, isDone ?? null)
      .query(
        `UPDATE Tasks
         SET Title = COALESCE(@title, Title),
             Description = COALESCE(@description, Description),
             IsDone = COALESCE(@isDone, IsDone)
         OUTPUT INSERTED.*
         WHERE Id = @id AND UserId = @userId`,
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// حذف وظیفه
router.delete("/:id", async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool
      .request()
      .input("id", db.sql.Int, req.params.id)
      .input("userId", db.sql.Int, req.userId)
      .query("DELETE FROM Tasks WHERE Id = @id AND UserId = @userId");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
