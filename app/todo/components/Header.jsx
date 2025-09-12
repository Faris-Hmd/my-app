import React from "react";
import styles from "../../dashboard.module.css";
import { FaPlus } from "react-icons/fa";

export default function Header({ onAdd, setShowsideBar }) {
  return (
    <header className={styles.header}>
      <div className={styles.sideBarBtn} onClick={() => setShowsideBar(true)}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <rect
            x="4"
            y="8"
            width="24"
            height="3"
            rx="1.5"
            fill="currentColor"
          />
          <rect
            x="4"
            y="15"
            width="24"
            height="3"
            rx="1.5"
            fill="currentColor"
          />
          <rect
            x="4"
            y="22"
            width="24"
            height="3"
            rx="1.5"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className={styles.logo}>TODO</div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button className={styles.addTask} onClick={onAdd}>
          <FaPlus /> Add Todo
        </button>
        {/* <button className={styles.signInBtn}>Sign In</button> */}
      </div>
    </header>
  );
}
