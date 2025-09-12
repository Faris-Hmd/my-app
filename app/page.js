"use client";
import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import TodosList from "./todo/components/TodosList";
import AddTodoModal from "./todo/components/AddTodoModal";
import Header from "./todo/components/Header";
import Sidebar from "./todo/components/Sidebar";
import { FaPlus } from "react-icons/fa";

export default function TodoDashboard() {
  useEffect(() => {
    document.body.classList.add("light-theme");
    return () => document.body.classList.remove("light-theme");
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAddTodo = (todoData) => {
    // Get current todos from localStorage
    const TODOS_KEY = "todos-list";
    const raw = localStorage.getItem(TODOS_KEY);
    let todos = [];
    try {
      todos = raw ? JSON.parse(raw) : [];
    } catch {
      todos = [];
    }
    // Add new todo with unique id
    const newTodo = {
      ...todoData,
      id: Date.now().toString(),
      status: "Undone",
    };
    todos.push(newTodo);
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    setShowModal(false);
    window.location.reload();
  };
  return (
    <div className={styles.dashboard}>
      <div style={{ display: "flex" }}>
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
        <div className={styles.mainSection}>
          <Header
            onAdd={() => setShowModal(true)}
            setShowsideBar={setSidebarOpen}
          />
          <div className={styles.boardAndDetail}>
            <TodosList />
          </div>
        </div>
      </div>
      <AddTodoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddTodo}
      />
      <button
        className={styles.addTodoFloatBtn}
        onClick={() => setShowModal(true)}
        aria-label="Add Todo"
      >
        <FaPlus />
      </button>
    </div>
  );
}
export { TodoDashboard };
