const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const pool = await db.poolPromise;

    const existing = await pool
      .request()
      .input("email", db.sql.NVarChar, email)
      .query("SELECT Id FROM Users WHERE Email = @email");

    if (existing.recordset.length > 0) {
      return res
        .status(409)
        .json({ message: "This email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("name", db.sql.NVarChar, name)
      .input("email", db.sql.NVarChar, email)
      .input("passwordHash", db.sql.NVarChar, passwordHash)
      .query(
        "INSERT INTO Users (Name, Email, PasswordHash) VALUES (@name, @email, @passwordHash)",
      );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("email", db.sql.NVarChar, email)
      .query(
        "SELECT Id, Name, Email, PasswordHash FROM Users WHERE Email = @email",
      );

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.Id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.Id, name: user.Name, email: user.Email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
