import React, { useRef } from "react";
import SidebarProgress from "./SidebarProgress";
import styles from "../../dashboard.module.css";

export default function Sidebar({ onClose }) {
  const sidebarRef = useRef();

  React.useEffect(() => {
    function handleClick(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <aside
      ref={sidebarRef}
      className={styles.sidebar}
      style={{ position: "fixed" }}
    >
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
      <div className={styles.sidebarTitle}>Todos</div>
      <SidebarProgress />
      {/* You can add navigation links or other sidebar content here */}
    </aside>
  );
}
