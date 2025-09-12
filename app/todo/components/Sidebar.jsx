import React from "react";
import SidebarProgress from "./SidebarProgress";
import styles from "../../dashboard.module.css";

export default function Sidebar({ onClose }) {
  return (
    <aside className={styles.sidebar} style={{ position: "fixed" }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          border: "none",
          fontSize: "1.5em",
          color: "#888",
          cursor: "pointer",
          zIndex: 2,
        }}
        aria-label="Close Sidebar"
      >
        &times;
      </button>
      <div className={styles.sidebarTitle}>Projects</div>
      <SidebarProgress />
      {/* You can add navigation links or other sidebar content here */}
    </aside>
  );
}
