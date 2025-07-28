"use client"
import  { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { db } from "../db/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
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
import Navbar from "../components/Navbar";
import { createPortal } from "react-dom";

const ITEM_TYPE = 'TODO_ITEM';

function DraggableTodo({ todo, idx, moveTodo, children }) {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item) {
      if (item.idx === idx) return;
      moveTodo(item.idx, idx);
      item.idx = idx;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: todo.id, idx },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  });
  drag(drop(ref));
  return (
    <li
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        ...children.props.style
      }}
    >
      {children.props.children}
    </li>
  );
}

function reorderArray(arr, from, to) {
  const updated = [...arr];
  const [removed] = updated.splice(from, 1);
  updated.splice(to, 0, removed);
  return updated;
}

function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

function TodoApp() {
  // ...existing code...
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
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
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }
    const unsub = onSnapshot(collection(db, "todos"), (snapshot) => {
      // Only show todos for this user
      const docs = snapshot.docs
        .filter(doc => doc.data().uid === user.uid)
        .map(doc => ({
          id: doc.id,
          text: doc.data().text,
          category: doc.data().category || "",
          order: doc.data().order ?? 0
        }));
      docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setTodos(docs);
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
  }, [user]);

  // Move todo in the list and persist order
  const moveTodo = async (from, to) => {
    setLoading(true);
    setTodos(prev => {
      const updated = reorderArray(prev, from, to);
      // Update order in Firestore
      Promise.all(
        updated.map((todo, idx) => updateDoc(doc(db, "todos", todo.id), { order: idx }))
      ).finally(() => setLoading(false));
      return updated;
    });
  };

  const handleAdd = async () => {
    if (input.trim() !== "" && user) {
      setLoading(true);
      let cat = category;
      if (cat === "Other") cat = customCategory.trim();
      await addDoc(collection(db, "todos"), { text: input, category: cat, uid: user.uid });
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
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    await deleteDoc(doc(db, "todos", id));
    setCompleted(prev => {
      const copy = { ...prev };
      delete copy[id];
      localStorage.setItem("copilot-todo-completed", JSON.stringify(copy));
      return copy;
    });
    setLoading(false);
  };

  const handleEditTodo = (todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  const handleSaveEditTodo = async (todo) => {
    if (editingTodoText.trim() !== "") {
      setLoading(true);
      await updateDoc(doc(db, "todos", todo.id), { text: editingTodoText });
      setEditingTodoId(null);
      setEditingTodoText("");
      setLoading(false);
    }
  };

  const handleCancelEditTodo = () => {
    setEditingTodoId(null);
    setEditingTodoText("");
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
    let cat = editingCategory;
    if (cat === "Other") cat = editingCustomCategory.trim();
    await updateDoc(doc(db, "todos", todo.id), { category: cat });
    setEditingCategoryId(null);
    setEditingCategory("");
    setEditingCustomCategory("");
    setLoading(false);
  };

  const handleDeleteCategory = async (cat) => {
    // Remove from Firestore
    const catsSnapshot = await getDocs(categoryCollection(db, "categories"));
    const match = catsSnapshot.docs.find(d => d.data().name === cat);
    if (match) await deleteCategoryDoc(categoryDoc(db, "categories", match.id));
    // Remove from dropdown
    setCategoryOptions(prev => prev.filter(c => c !== cat));
    // If currently selected, clear
    if (category === cat) setCategory("");
  };

  const handleEditDropdownCategory = (cat) => {
    setEditingDropdownCategory(cat);
    setEditingDropdownValue(cat);
  };

  const handleSaveDropdownCategory = async (oldCat) => {
    if (!editingDropdownValue.trim() || categoryOptions.includes(editingDropdownValue.trim())) return;
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

  const dndBackend = isTouchDevice() ? TouchBackend : HTML5Backend;
  // Google Auth handlers
  const handleLogin = async () => {
    setLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      alert("Login failed");
    }
    setLoading(false);
  };
  const handleLogout = async () => {
    setLoading(true);
    const auth = getAuth();
    await signOut(auth);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat fixed`,
      position: "relative",
      transition: "background 0.2s",
      fontFamily: "'Nunito Sans', Inter, sans-serif"
    }}>
      {/* Google Auth UI - moved to left */}
      <div style={{ position: 'absolute', top: 18, left: 18, zIndex: 100, maxWidth: '90vw' }}>
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 10,
              padding: '4px 8px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
              minWidth: 0,
              maxWidth: 320,
            }}
          >
            {/* Show Google profile image if available, else fallback to cat avatar PNG */}
            <span style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#f3f4f6', border: '1.5px solid #cbd5e1', overflow: 'hidden', flexShrink: 0 }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="user avatar"
                  style={{ width: 26, height: 26, objectFit: 'cover', borderRadius: '50%', background: '#fff' }}
                  onError={e => { e.target.onerror = null; e.target.src = 'https://raw.githubusercontent.com/Faris-Hmd/cdn-assets/main/cat-avatar.png'; }}
                />
              ) : (
                <img
                  src="https://raw.githubusercontent.com/Faris-Hmd/cdn-assets/main/cat-avatar.png"
                  alt="cat avatar"
                  style={{ width: 26, height: 26, objectFit: 'cover', borderRadius: '50%', background: '#fff' }}
                />
              )}
            </span>
            <span
              style={{
                color: '#23234a',
                fontWeight: 600,
                fontSize: 14,
                background: 'none',
                borderRadius: 6,
                padding: '2px 6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 120,
                display: 'inline-block',
              }}
              title={user.displayName || user.email}
            >
              {user.displayName || user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: '#ff5a5f',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                marginLeft: 2,
                marginTop: 2,
                flexShrink: 0,
              }}
            >
              Logout
            </button>
            <style>{`
              @media (max-width: 480px) {
                .copilot-userbar { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
                .copilot-userbar span { max-width: 90vw !important; font-size: 13px !important; }
                .copilot-userbar button { width: 100%; margin-left: 0 !important; }
              }
            `}</style>
          </div>
        ) : (
          <button onClick={handleLogin} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>Login with Google</button>
        )}
      </div>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 60, height: 60, border: '6px solid #6366f1', borderTop: '6px solid #fff', borderRadius: '50%',
            animation: 'spin 1s linear infinite', background: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
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
      {/* Shared Navbar */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div
        className="copilot-todo-main"
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
        {!user && (
          <div style={{ textAlign: 'center', margin: '40px 0', color: '#333', fontWeight: 600, fontSize: 20 }}>
            Please login to view your todos.
          </div>
        )}
        <h2 className="copilot-todo-title" style={{ textAlign: "center", color: darkMode ? "#f3f4f6" : "#222", fontWeight: 700, fontSize: 28, marginBottom: 24, fontFamily: "'Nunito Sans', Inter, sans-serif" }}>To-Do List</h2>
        {user && (
        <div className="copilot-todo-inputs" style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "22px",
          alignItems: "stretch",
        }}>
      <style>{`
        @media (max-width: 600px) {
          .copilot-todo-main {
            max-width: 99vw !important;
            padding: 12px 2vw 12px 2vw !important;
            border-radius: 12px !important;
          }
          .copilot-todo-title {
            font-size: 20px !important;
            margin-bottom: 12px !important;
          }
          .copilot-todo-inputs input[type="text"] {
            font-size: 15px !important;
            padding: 8px 8px !important;
            border-radius: 7px !important;
          }
          .copilot-todo-inputs button {
            font-size: 15px !important;
            padding: 8px 0 !important;
            border-radius: 7px !important;
          }
        }
        @media (max-width: 420px) {
          .copilot-todo-main {
            padding: 6px 1vw 6px 1vw !important;
            border-radius: 7px !important;
          }
          .copilot-todo-title {
            font-size: 16px !important;
            margin-bottom: 7px !important;
          }
          .copilot-todo-inputs input[type="text"] {
            font-size: 13px !important;
            padding: 6px 4px !important;
            border-radius: 5px !important;
          }
          .copilot-todo-inputs button {
            font-size: 13px !important;
            padding: 6px 0 !important;
            border-radius: 5px !important;
          }
        }
      `}</style>
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
        )}
        <DndProvider backend={dndBackend}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {todos.map((todo, idx) => (
              <DraggableTodo key={todo.id} todo={todo} idx={idx} moveTodo={moveTodo}>
                <li
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
                  {editingTodoId === todo.id ? (
                    <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={editingTodoText}
                        onChange={e => setEditingTodoText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEditTodo(todo);
                          if (e.key === 'Escape') handleCancelEditTodo();
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          fontSize: 17,
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: darkMode ? '1.5px solid #6366f1' : '1.5px solid #cbd5e1',
                          background: darkMode ? '#23234a' : '#f9fafb',
                          color: darkMode ? '#f3f4f6' : '#1a202c',
                          fontFamily: "'Nunito Sans', Inter, sans-serif"
                        }}
                      />
                      <button
                        onClick={() => handleSaveEditTodo(todo)}
                        style={{
                          background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                        }}
                      >Save</button>
                      <button
                        onClick={handleCancelEditTodo}
                        style={{
                          background: '#e5e7eb', color: '#333', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                        }}
                      >Cancel</button>
                    </span>
                  ) : (
                    <span
                      style={{
                        color: completed[todo.id] ? (darkMode ? '#52525b' : '#a0aec0') : (darkMode ? '#f3f4f6' : '#1a202c'),
                        flex: 1,
                        fontSize: 17,
                        wordBreak: "break-word",
                        textDecoration: completed[todo.id] ? 'line-through' : 'none',
                        opacity: completed[todo.id] ? 0.6 : 1,
                        transition: 'all 0.18s',
                        fontFamily: "'Nunito Sans', Inter, sans-serif",
                        display: 'flex', alignItems: 'center', gap: 8
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
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {editingTodoId !== todo.id && (
                      <button
                        onClick={() => handleEditTodo(todo)}
                        style={{
                          background: '#f3f4f6', color: '#0070f3', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                        }}
                      >Edit</button>
                    )}
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
                        boxShadow: "0 1px 4px rgba(255,90,95,0.08)"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              </DraggableTodo>
            ))}
          </ul>
        </DndProvider>
      </div>
    </div>
  );
  
}

export default TodoApp;