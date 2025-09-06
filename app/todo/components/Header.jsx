import React from "react";
import styles from "../dashboard.module.css";
import { FaPlus } from "react-icons/fa";

export default function Header({ onAdd }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>TODO</div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button className={styles.addTask} onClick={onAdd}>
          <FaPlus /> Add Todo
        </button>
        <button className={styles.signInBtn}>Sign In</button>
      </div>
    </header>
  );
}
