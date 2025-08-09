import React from "react";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar({ darkMode, setDarkMode }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  // If using next/navigation, uncomment below and comment above:
  // const pathname = usePathname();
  const isAbout = pathname === "/about";
  const isTodo = pathname === "/todo";
  let linkHref = isAbout ? "/todo" : "/about";
  let linkLabel = isAbout ? "To-Do" : "About";
  return (
    <nav
      className={styles.navbar}
      style={{
        background: darkMode ? "#23234a" : "#0070f3",
        boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ flex: 1 }} />
      <div className={styles.rightColumn}>
        {/* User detail row (replace with actual user info if needed) */}
       
        <div
          className={styles.navbarLinks + " copilot-navbar-links"}
          style={{
            background: darkMode ? 'rgba(35,35,74,0.18)' : 'rgba(255,255,255,0.82)',
            boxShadow: darkMode ? '0 1px 6px rgba(99,102,241,0.08)' : '0 1px 6px rgba(0,0,0,0.04)'
          }}
        >
          <a
            href={linkHref}
            className={styles.navbarLink + " copilot-navbar-link"}
            style={{
              color: darkMode ? '#a5b4fc' : '#23234a',
              background: darkMode ? 'rgba(99,102,241,0.13)' : 'rgba(255,255,255,0.92)',
              border: darkMode ? '1.5px solid #6366f1' : '1.5px solid #cbd5e1',
              boxShadow: darkMode ? '0 1px 4px rgba(99,102,241,0.08)' : '0 1px 4px rgba(0,0,0,0.03)'
            }}
          >
            {linkLabel}
          </a>
          <button
            onClick={() => setDarkMode(d => !d)}
            className="copilot-navbar-darkmode"
            style={{
              background: darkMode ? "rgba(24,24,27,0.92)" : "rgba(255,255,255,0.92)",
              border: darkMode ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.18)" : "0 1px 4px rgba(0,0,0,0.04)",
              transition: "all 0.18s",
              outline: "none"
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              // Moon icon
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 13.5C16.5 13.83 15.42 14 14.25 14C10.11 14 6.75 10.64 6.75 6.5C6.75 5.33 6.92 4.25 7.25 3.25C4.13 4.25 2 7.13 2 10.5C2 14.64 5.36 18 9.5 18C12.87 18 15.75 15.87 16.75 12.75Z" fill="#fbbf24"/>
              </svg>
            ) : (
              // Sun icon
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="5" fill="#fbbf24"/>
                <g stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="11" y1="1.5" x2="11" y2="4"/>
                  <line x1="11" y1="18" x2="11" y2="20.5"/>
                  <line x1="1.5" y1="11" x2="4" y2="11"/>
                  <line x1="18" y1="11" x2="20.5" y2="11"/>
                  <line x1="4.93" y1="4.93" x2="6.6" y2="6.6"/>
                  <line x1="15.4" y1="15.4" x2="17.07" y2="17.07"/>
                  <line x1="4.93" y1="17.07" x2="6.6" y2="15.4"/>
                  <line x1="15.4" y1="6.6" x2="17.07" y2="4.93"/>
                </g>
              </svg>
            )}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, width: 40, marginLeft: 2 }}>
            {/* Logo on the right */}
            <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="22" r="20" fill="#fff" fillOpacity="0.18" stroke="#fff" strokeWidth="2.5" />
              <path d="M14.5 22.5L20 28L30 17" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
      {/* Styles moved to Navbar.module.css */}
    </nav>
  );
}
