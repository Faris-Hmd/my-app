import React, { useEffect, useState } from "react";
import styles from "../../dashboard.module.css";

const categories = ["Personal", "Work", "Learning", "Finance", "Other"];

function getCircleColor(category) {
  return category === "Personal"
    ? "#6c63ff"
    : category === "Work"
    ? "#00bcd4"
    : category === "Learning"
    ? "#4caf50"
    : category === "Finance"
    ? "#ff9800"
    : "#888";
}

function getCategoryProgress(todos, category) {
  const all = todos.filter((t) => (t.project || "Other") === category);
  const done = all.filter((t) => t.status === "Done");
  const percent = all.length ? Math.round((done.length / all.length) * 100) : 0;
  return { percent, done: done.length, total: all.length };
}

function ProgressCircle({ percent, color }) {
  const radius = 10;
  const stroke = 3;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Start from top (12 o'clock) by rotating -90deg
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      style={{ marginRight: 8, transform: "rotate(-90deg)" }}
    >
      <circle
        stroke="#e0e0e0"
        fill="none"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="none"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: "stroke-dashoffset 0.3s" }}
      />
    </svg>
  );
}

export default function SidebarProgress() {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    function updateTodos() {
      try {
        const data = JSON.parse(localStorage.getItem("todos-list")) || [];
        setTodos(data);
      } catch {
        setTodos([]);
      }
    }
    updateTodos();
    window.addEventListener("storage", updateTodos);
    return () => window.removeEventListener("storage", updateTodos);
  }, []);
  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <h4
        style={{
          color: "#fff",
          marginBottom: 8,
        }}
      >
        Progress
      </h4>
      {categories.map((category) => {
        const { percent, done, total } = getCategoryProgress(todos, category);
        return (
          <div
            key={category}
            style={{
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              width: "100%",
              borderRadius: 4,
              padding: "4px 8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <ProgressCircle
              percent={percent}
              color={getCircleColor(category)}
            />
            <div style={{ fontWeight: 500, marginBottom: 4, color: "#ddd" }}>
              {category}
            </div>
            <div
              style={{ fontSize: "0.9em", color: "#888", marginLeft: "auto" }}
            >
              {percent}% ({done} / {total})
            </div>
          </div>
        );
      })}
    </div>
  );
}
