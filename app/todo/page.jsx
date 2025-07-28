"use client"
import  { useState, useEffect } from "react";
import { db } from "../db/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc as deleteCategoryDoc,
  collection as categoryCollection,
  doc as categoryDoc
} from "firebase/firestore";
import { addCategory, getCategories } from "../db/categories";
import React, { useRef } from "react";
import { createPortal } from "react-dom";

function TodoApp() {
  const [loading, setLoading] = useState(false);
  // Inject Nunito Sans font from Google Fonts
  useEffect(() => {
    if (!document.getElementById('nunito-sans-font')) {
      const link = document.createElement('link');
      link.id = 'nunito-sans-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);
  const [todos, setTodos] = useState([]);
  const [completed, setCompleted] = useState({});
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingCustomCategory, setEditingCustomCategory] = useState("");
  const [categoryOptions, setCategoryOptions] = useState(["Work", "Personal", "Shopping", "Study", "Other"]);
  const [editingDropdownCategory, setEditingDropdownCategory] = useState(null);
  const [editingDropdownValue, setEditingDropdownValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('copilot-todo-dark');
      if (stored) return stored === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const dropdownRef = useRef();
  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('copilot-todo-dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "todos"), (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        category: doc.data().category || ""
      })));
    });
    // Load completed state from localStorage
    const stored = localStorage.getItem("copilot-todo-completed");
    if (stored) setCompleted(JSON.parse(stored));
    // Fetch categories from Firestore
    getCategories().then(cats => {
      // Save preset categories if not present
      const presets = ["Work", "Personal", "Shopping", "Study"];
      Promise.all(
        presets
          .filter(preset => !cats.includes(preset))
          .map(preset => addCategory(preset))
      ).then(() => {
        setCategoryOptions(["Work", "Personal", "Shopping", "Study", ...cats.filter(c => !presets.includes(c)), "Other"]);
      });
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (input.trim() !== "") {
      setLoading(true);
      try {
        let cat = category;
        if (cat === "Other") cat = customCategory.trim();
        await addDoc(collection(db, "todos"), { text: input, category: cat });
        // Save new custom category to Firestore if not already present
        if (cat && !["Work", "Personal", "Shopping", "Study"].includes(cat) && !categoryOptions.includes(cat)) {
          await addCategory(cat);
          setCategoryOptions(prev => [
            ...prev.filter(c => c !== "Other"),
            cat,
            "Other"
          ]);
        }
        setInput("");
        setCategory("");
        setCustomCategory("");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "todos", id));
      setCompleted(prev => {
        const copy = { ...prev };
        delete copy[id];
        localStorage.setItem("copilot-todo-completed", JSON.stringify(copy));
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = (id) => {
    setCompleted(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem("copilot-todo-completed", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCategoryUpdate = async (todo) => {
    setLoading(true);
    try {
      let cat = editingCategory;
      if (cat === "Other") cat = editingCustomCategory.trim();
      await updateDoc(doc(db, "todos", todo.id), { category: cat });
      setEditingCategoryId(null);
      setEditingCategory("");
      setEditingCustomCategory("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    setLoading(true);
    try {
      // Remove from Firestore
      const catsSnapshot = await getDocs(categoryCollection(db, "categories"));
      const match = catsSnapshot.docs.find(d => d.data().name === cat);
      if (match) await deleteCategoryDoc(categoryDoc(db, "categories", match.id));
      // Remove from dropdown
      setCategoryOptions(prev => prev.filter(c => c !== cat));
      // If currently selected, clear
      if (category === cat) setCategory("");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDropdownCategory = (cat) => {
    setEditingDropdownCategory(cat);
    setEditingDropdownValue(cat);
  };

  const handleSaveDropdownCategory = async (oldCat) => {
    if (!editingDropdownValue.trim() || categoryOptions.includes(editingDropdownValue.trim())) return;
    setLoading(true);
    try {
      // Update in Firestore
      const catsSnapshot = await getDocs(categoryCollection(db, "categories"));
      const match = catsSnapshot.docs.find(d => d.data().name === oldCat);
      if (match) {
        await updateDoc(categoryDoc(db, "categories", match.id), { name: editingDropdownValue.trim() });
      }
      setCategoryOptions(prev => prev.map(c => c === oldCat ? editingDropdownValue.trim() : c));
      if (category === oldCat) setCategory(editingDropdownValue.trim());
      setEditingDropdownCategory(null);
      setEditingDropdownValue("");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDropdownEdit = () => {
    setEditingDropdownCategory(null);
    setEditingDropdownValue("");
  };

  // Open dropdown and set position for portal
  const openDropdown = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setDropdownOpen(true);
  };

  // Close dropdown on outside click, but not when clicking inside portal
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !(document.getElementById('category-portal') && document.getElementById('category-portal').contains(e.target))
      ) {
        setDropdownOpen(false);
        setEditingDropdownCategory(null);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // When editing or deleting a category, update selected value if needed
  useEffect(() => {
    if (editingDropdownCategory === null && !categoryOptions.includes(category)) {
      setCategory("");
    }
  }, [categoryOptions, editingDropdownCategory]);

  return (
    <div style={{
      minHeight: "100vh",
      background: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat fixed`,
      position: "relative",
      transition: "background 0.2s",
      fontFamily: "'Nunito Sans', Inter, sans-serif"
    }}>
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.18)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "all"
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: "6px solid #e0e7ff",
            borderTop: `6px solid ${darkMode ? '#6366f1' : '#0070f3'}`,
            borderRadius: "50%",
            animation: "copilot-spin 1s linear infinite"
          }} />
          <style>{`
            @keyframes copilot-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      {/* Overlay for readability */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: darkMode ? "rgba(24,24,27,0.88)" : "rgba(243,244,246,0.88)",
        zIndex: 0,
        pointerEvents: "none"
      }} />
      {/* Navbar */}
      <nav style={{
        width: "100%",
        background: darkMode ? "#23234a" : "#0070f3",
        padding: "18px 0 16px 0",
        marginBottom: 32,
        boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, width: 36 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="#fff" fillOpacity="0.13" stroke="#fff" strokeWidth="2" />
              <path d="M12.5 18.5L17 23L24 15" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Todo with Copilot</span>
        </div>
        <button
          onClick={() => setDarkMode(d => !d)}
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
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
      </nav>
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "32px 24px 24px 24px",
          borderRadius: "24px",
          boxShadow: darkMode
            ? "0 8px 40px 0 rgba(35,35,74,0.32), 0 1.5px 8px 0 rgba(99,102,241,0.10)"
            : "0 8px 40px 0 rgba(0,112,243,0.10), 0 1.5px 8px 0 rgba(56,112,255,0.07)",
          background: darkMode
            ? "rgba(35,35,74,0.55)"
            : "rgba(255,255,255,0.55)",
          fontFamily: "'Nunito Sans', Inter, sans-serif",
          width: "95%",
          minWidth: 0,
          color: darkMode ? "#f3f4f6" : undefined,
          transition: "background 0.2s, color 0.2s",
          position: "relative",
          zIndex: 2,
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          border: darkMode ? "1.5px solid rgba(99,102,241,0.22)" : "1.5px solid rgba(56,112,255,0.13)",
          overflow: "hidden"
        }}
      >
        <h2 style={{ textAlign: "center", color: darkMode ? "#f3f4f6" : "#222", fontWeight: 700, fontSize: 28, marginBottom: 24, fontFamily: "'Nunito Sans', Inter, sans-serif" }}>To-Do List</h2>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "22px",
          alignItems: "stretch",
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="Add a new task"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: darkMode ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
              fontSize: "17px",
              background: darkMode ? "#23234a" : "#f9fafb",
              color: darkMode ? "#f3f4f6" : "#1a202c",
              marginBottom: 0,
              fontWeight: 500,
              boxShadow: darkMode ? "0 1px 8px rgba(0,0,0,0.18)" : "0 1px 4px rgba(0,0,0,0.03)",
              fontFamily: "'Nunito Sans', Inter, sans-serif"
            }}
          />
          <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "8px 0 0 0" }}>
            <div
              ref={dropdownRef}
              style={{
                minWidth: 0,
                width: "100%",
                maxWidth: 400,
                display: "flex",
                justifyContent: "center"
              }}
            >
              <div
                onClick={openDropdown}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: "12px",
                  border: category ? (darkMode ? "2px solid #6366f1" : "2px solid #6366f1") : (darkMode ? "2px solid #44446a" : "2px solid #cbd5e1"),
                  fontSize: "16px",
                  background: category ? (darkMode ? "linear-gradient(90deg, #3730a3 60%, #23234a 100%)" : "linear-gradient(90deg, #e0e7ff 60%, #f0f5ff 100%)") : (darkMode ? "#23234a" : "#f9fafb"),
                  color: category ? (darkMode ? "#e0e7ff" : "#3730a3") : (darkMode ? "#aaa" : "#888"),
                  cursor: "pointer",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  boxShadow: category ? (darkMode ? "0 2px 8px rgba(56, 112, 255, 0.13)" : "0 2px 8px rgba(56, 112, 255, 0.07)") : (darkMode ? "0 1px 8px rgba(0,0,0,0.18)" : "0 1px 4px rgba(0,0,0,0.03)"),
                  transition: "all 0.18s"
                }}
              >
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90%" }}>
                  {category || "Select category"}
                </span>
                <span style={{ marginLeft: 10, fontSize: 20, color: category ? (darkMode ? "#a5b4fc" : "#6366f1") : (darkMode ? "#666" : "#888") }}>&#9662;</span>
              </div>
              {dropdownOpen && createPortal(
                <div
                  id="category-portal"
                  style={{
                    position: "fixed",
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width > 0 ? dropdownPosition.width : 320,
                    minWidth: 280,
                    maxWidth: 480,
                    background: darkMode ? "#23234a" : "#fff",
                    border: darkMode ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                    borderRadius: "12px",
                    boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.30)" : "0 8px 32px rgba(0,0,0,0.18)",
                    zIndex: 9999,
                    maxHeight: 340,
                    overflowY: "auto",
                    marginTop: 4,
                    left: `max(16px, ${dropdownPosition.left}px)`,
                    right: `max(16px, calc(100vw - ${dropdownPosition.left + (dropdownPosition.width || 320)}px))`,
                    padding: 0
                  }}
                  onMouseDown={e => e.stopPropagation()}
                >
                  {[...categoryOptions].map(opt => (
                    ["Work", "Personal", "Shopping", "Study", "Other"].includes(opt) ? (
                      <div
                        key={opt}
                        onClick={() => {
                          setCategory(opt);
                          setDropdownOpen(false);
                          if (opt !== "Other") setCustomCategory("");
                        }}
                        style={{
                          padding: "10px 12px",
                          color: darkMode ? "#f3f4f6" : "#222",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          borderBottom: darkMode ? "1px solid #35356a" : "1px solid #f3f4f6"
                        }}
                      >
                        {opt}
                      </div>
                    ) : (
                      <div
                        key={opt}
                        style={{
                          padding: "10px 12px",
                          color: darkMode ? "#f3f4f6" : "#222",
                          display: "flex",
                          alignItems: "center",
                          borderBottom: darkMode ? "1px solid #35356a" : "1px solid #f3f4f6"
                        }}
                      >
                        {editingDropdownCategory === opt ? (
                          <>
                            <input
                              type="text"
                              value={editingDropdownValue}
                              onChange={e => setEditingDropdownValue(e.target.value)}
                              style={{
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                                marginRight: 4
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveDropdownCategory(opt)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontSize: "12px",
                                marginRight: 2,
                                cursor: "pointer"
                              }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDropdownEdit}
                              style={{
                                background: "#e5e7eb",
                                color: "#333",
                                border: "none",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontSize: "12px",
                                cursor: "pointer"
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span
                              onClick={() => {
                                setCategory(opt);
                                setDropdownOpen(false);
                              }}
                              style={{ flex: 1, cursor: "pointer" }}
                            >
                              {opt}
                            </span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleEditDropdownCategory(opt);
                              }}
                              style={{
                                marginLeft: 6,
                                background: "#f3f4f6",
                                border: "none",
                                color: "#0070f3",
                                cursor: "pointer",
                                fontSize: "14px",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                display: "flex",
                                alignItems: "center",
                                transition: "background 0.15s",
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                              onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
                            >
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 4}}>
                                <path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5zM17.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.76 3.76 1.83-1.83z" fill="#0070f3"/>
                              </svg>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteCategory(opt);
                              }}
                              style={{
                                marginLeft: 4,
                                background: "#f87171",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontSize: "12px",
                                cursor: "pointer"
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )
                  ))}
                </div>,
                document.body
              )}
            </div>
          </div>
          {category === "Other" && (
            <input
              type="text"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              placeholder="Custom category"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: darkMode ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                fontSize: "17px",
                background: darkMode ? "#23234a" : "#f9fafb",
                marginTop: 6,
                fontWeight: 500,
                color: darkMode ? "#f3f4f6" : "#1a202c",
                fontFamily: "'Nunito Sans', Inter, sans-serif"
              }}
            />
          )}
          <button
            onClick={handleAdd}
            style={{
              marginTop: 10,
              padding: "12px 0",
              borderRadius: "10px",
              border: "none",
              background: darkMode ? "#6366f1" : "#0070f3",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: darkMode ? "0 2px 8px rgba(99,102,241,0.18)" : "0 2px 8px rgba(0,112,243,0.08)",
              minWidth: 120,
              width: "100%",
              letterSpacing: 0.2,
              transition: "background 0.18s, box-shadow 0.18s"
            }}
          >
            Add
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {todos.map((todo, idx) => (
            <li
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: idx !== todos.length - 1 ? (darkMode ? "1px solid #35356a" : "1px solid #e5e7eb") : "none",
                flexWrap: "wrap"
              }}
            >
              <input
                type="checkbox"
                checked={!!completed[todo.id]}
                onChange={() => handleToggleCompleted(todo.id)}
                style={{
                  marginRight: 14,
                  width: 20,
                  height: 20,
                  accentColor: darkMode ? '#a5b4fc' : '#6366f1',
                  cursor: 'pointer',
                  background: darkMode ? '#23234a' : undefined
                }}
              />
              <span
                style={{
                  color: completed[todo.id] ? (darkMode ? '#52525b' : '#a0aec0') : (darkMode ? '#f3f4f6' : '#1a202c'),
                  flex: 1,
                  fontSize: 17,
                  wordBreak: "break-word",
                  textDecoration: completed[todo.id] ? 'line-through' : 'none',
                  opacity: completed[todo.id] ? 0.6 : 1,
                  transition: 'all 0.18s',
                  fontFamily: "'Nunito Sans', Inter, sans-serif"
                }}
              >
                {todo.text}
                {todo.category && (
                  <span style={{
                    background: darkMode ? "#3730a3" : "#e0e7ff",
                    color: darkMode ? "#e0e7ff" : "#3730a3",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    marginLeft: "10px",
                    fontSize: "14px"
                  }}>
                    {todo.category}
                  </span>
                )}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                style={{
                  background: "#ff5a5f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 500,
                  boxShadow: "0 1px 4px rgba(255,90,95,0.08)",
                  marginTop: 6
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  
}

export default TodoApp;