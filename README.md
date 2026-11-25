# Task Manager

A full-stack task management app where each user signs up, logs in, and manages their own private list of tasks.

## Features

- User registration and login with JWT authentication
- Passwords securely hashed with bcrypt
- Create, complete, and delete tasks
- Every user sees only their own tasks
- Responsive, clean interface

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | Microsoft SQL Server |
| Auth | JSON Web Tokens (JWT), bcryptjs |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/tasks` | List the current user's tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update or complete a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Getting Started

### Prerequisites

- Node.js (LTS)
- SQL Server (Express edition is enough)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/task-manager.git
cd task-manager
```

### 2. Set up the database

Create a database named `TaskManagerDB` and run:

```sql
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Tasks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    IsDone BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

### 3. Configure the backend

Inside `backend/`, create a `.env` file:

```
PORT=5000
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=TaskManagerDB
DB_USER=your_sql_user
DB_PASSWORD=your_sql_password
JWT_SECRET=a_long_random_secret
```

### 4. Run the backend

```bash
cd backend
npm install
node server.js
```

### 5. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## What I Learned

- Building a REST API with Express
- Secure authentication with JWT and password hashing
- Connecting Node.js to SQL Server
- Managing state and routing in React
- Protecting routes so users only access their own data

## Author

aliasadn · [GitHub](https://github.com/aliasadn)
