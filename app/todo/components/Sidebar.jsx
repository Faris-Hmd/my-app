import SidebarProgress from "./SidebarProgress";
import styles from "../../dashboard.module.css";
import { FaSignOutAlt } from "react-icons/fa";
import { useEffect } from "react";

export default function Sidebar({ onClose }) {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [window.innerWidth]);
  return (
    <>
      <div
        className={styles.sidebarOverlay}
        onClick={onClose}
        aria-label="Close Sidebar Overlay"
      />
      <aside className={styles.sidebar} style={{ position: "fixed" }}>
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
