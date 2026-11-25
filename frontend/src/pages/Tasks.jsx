import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const res = await client.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setError("Could not load tasks");
      }
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await client.post("/tasks", { title });
      setTasks([res.data, ...tasks]);
      setTitle("");
    } catch (err) {
      setError("Could not add task");
    }
  }

  async function toggleTask(task) {
    try {
      const res = await client.put(`/tasks/${task.Id}`, {
        isDone: !task.IsDone,
      });
      setTasks(tasks.map((t) => (t.Id === task.Id ? res.data : t)));
    } catch (err) {
      setError("Could not update task");
    }
  }

  async function deleteTask(id) {
    try {
      await client.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.Id !== id));
    } catch (err) {
      setError("Could not delete task");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  }

  return (
    <div className="card">
      <div className="header">
        <div>
          <h1>Hi, {userName} 👋</h1>
          <p className="subtitle">
            {tasks.filter((t) => !t.IsDone).length} task(s) left to do
          </p>
        </div>
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <form onSubmit={addTask} className="add-form">
        <input
          placeholder="What do you need to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.Id} className={task.IsDone ? "done" : ""}>
            <input
              type="checkbox"
              checked={task.IsDone}
              onChange={() => toggleTask(task)}
            />
            <span>{task.Title}</span>
            <button className="danger" onClick={() => deleteTask(task.Id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="empty">Nothing here yet. Add your first task above ✨</p>
      )}
    </div>
  );
}
