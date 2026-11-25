import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High" };

function isOverdue(task) {
  if (!task.DueDate || task.IsDone) return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.DueDate.slice(0, 10) < today;
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
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
      const res = await client.post("/tasks", {
        title,
        priority,
        dueDate: dueDate || null,
      });
      setTasks([res.data, ...tasks]);
      setTitle("");
      setDueDate("");
      setPriority("medium");
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

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.IsDone).length;
  const leftCount = total - doneCount;

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.IsDone;
    if (filter === "done") return t.IsDone;
    return true;
  });

  return (
    <div className="card">
      <div className="header">
        <div>
          <h1>Hi, {userName} 👋</h1>
          <p className="subtitle">{leftCount} task(s) left to do</p>
        </div>
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <strong>{total}</strong>
          <span>Total</span>
        </div>
        <div className="stat">
          <strong>{leftCount}</strong>
          <span>Left</span>
        </div>
        <div className="stat">
          <strong>{doneCount}</strong>
          <span>Done</span>
        </div>
      </div>

      <form onSubmit={addTask} className="new-task">
        <input
          placeholder="What do you need to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="new-task-row">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button type="submit">Add</button>
        </div>
      </form>

      <div className="filters">
        {[
          ["all", "All"],
          ["active", "To do"],
          ["done", "Done"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "tab active" : "tab"}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <ul className="task-list">
        {visibleTasks.map((task) => (
          <li key={task.Id} className={task.IsDone ? "done" : ""}>
            <input
              type="checkbox"
              checked={task.IsDone}
              onChange={() => toggleTask(task)}
            />
            <div className="task-info">
              <span>{task.Title}</span>
              <div className="meta">
                <span className={`badge ${task.Priority}`}>
                  {PRIORITY_LABELS[task.Priority]}
                </span>
                {task.DueDate && (
                  <span className={isOverdue(task) ? "due overdue" : "due"}>
                    📅 {task.DueDate.slice(0, 10)}
                  </span>
                )}
              </div>
            </div>
            <button className="danger" onClick={() => deleteTask(task.Id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {visibleTasks.length === 0 && (
        <p className="empty">
          {tasks.length === 0
            ? "Nothing here yet. Add your first task above ✨"
            : "No tasks in this view."}
        </p>
      )}
    </div>
  );
}
