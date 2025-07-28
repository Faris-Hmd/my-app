"use client"
import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function AboutPage() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('copilot-todo-dark');
      if (stored) return stored === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  React.useEffect(() => {
    localStorage.setItem('copilot-todo-dark', darkMode);
  }, [darkMode]);

  return (
    <div style={{
      minHeight: "100vh",
      background: darkMode
        ? "rgba(24,24,27,0.88)"
        : "rgba(243,244,246,0.88)",
      fontFamily: "'Nunito Sans', Inter, sans-serif"
    }}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div style={{ maxWidth: 600, margin: '60px auto', padding: 24, background: 'rgba(255,255,255,0.92)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>About</h1>
        <p style={{ fontSize: 18, lineHeight: 1.7, color: '#23234a' }}>
          This is a simple To-Do List app built with Next.js, React, and Firebase. You can manage your tasks, organize them by category, and sync your data with Google authentication. Drag and drop to reorder your tasks, and enjoy a clean, modern UI with dark mode support.
        </p>
        <p style={{ marginTop: 24, fontSize: 15, color: '#6366f1' }}>
          &copy; {new Date().getFullYear()} Copilot Todo App
        </p>
      </div>
    </div>
  );
}
