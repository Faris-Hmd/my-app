import React, { useRef } from "react";
import SidebarProgress from "./SidebarProgress";
import styles from "../../dashboard.module.css";
import { FaSignOutAlt } from "react-icons/fa";

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
    <>
      <div
        className={styles.sidebarOverlay}
        onClick={onClose}
        aria-label="Close Sidebar Overlay"
      />
      <aside
        ref={sidebarRef}
        className={styles.sidebar}
        style={{ position: "fixed" }}
      >
        <button
          className={styles.modalCloseBtn}
          onClick={onClose}
          style={{ color: "#fff" }}
          aria-label="Close Sidebar"
        >
          &times;
        </button>
        <div className={styles.sidebarTitle}>Todos</div>
        <div className={styles.userInfoSidebar}>
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User"
            className={styles.userPhotoSidebar}
          />
          <div className={styles.userNameSidebar}>Faris Hmd</div>
          <div className={styles.logoutButton}>
            <FaSignOutAlt />
          </div>
        </div>
        <SidebarProgress />
        {/* You can add navigation links or other sidebar content here */}
      </aside>
    </>
  );
}
