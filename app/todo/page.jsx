"use client"
import  { useState } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() !== "") {
      setTodos([...todos, input]);
      setInput("");
    }
  };

  const handleDelete = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "40px auto",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        background: "#fff",
        fontFamily: "sans-serif"
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>To-Do List</h2>
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Add a new task"
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#0070f3",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Add
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo, idx) => (
          <li
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: idx !== todos.length - 1 ? "1px solid #eee" : "none"
            }}
          >
            <span style={{ color: "#444" }}>{todo}</span>
            <button
              onClick={() => handleDelete(idx)}
              style={{
                background: "#ff5a5f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;