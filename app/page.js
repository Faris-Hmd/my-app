"use client";
import React, { useState } from "react";
import styles from "./dashboard.module.css";
import { FaPlus } from "react-icons/fa";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./db/firebase";
import TodosList from "./todo/components/TodosList";
import AddTodoModal from "./todo/components/AddTodoModal";

function Header({ onAdd }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>TODO</div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button className={styles.addTask} onClick={onAdd}>
          <FaPlus />
        </button>
        <button className={styles.signInBtn}>Sign In</button>
      </div>
    </header>
  );
}

export default function TodoDashboard() {
  const [showModal, setShowModal] = useState(false);
  const handleAddTodo = async (todoData) => {
    await addDoc(collection(db, "todos"), {
      ...todoData,
      status: "To Do",
    });
    window.location.reload();
  };
  return (
    <div className={styles.dashboard}>
      <div className={styles.mainSection}>
        <Header onAdd={() => setShowModal(true)} />
        <div className={styles.boardAndDetail}>
          <TodosList />
        </div>
      </div>
      <AddTodoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddTodo}
      />
    </div>
  );
}
export { TodoDashboard };
