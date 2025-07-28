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
  const [todos, setTodos] = useState([]);
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
  const dropdownRef = useRef();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "todos"), (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        category: doc.data().category || ""
      })));
    });
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
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const handleCategoryUpdate = async (todo) => {
    let cat = editingCategory;
    if (cat === "Other") cat = editingCustomCategory.trim();
    await updateDoc(doc(db, "todos", todo.id), { category: cat });
    setEditingCategoryId(null);
    setEditingCategory("");
    setEditingCustomCategory("");
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

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      {/* Navbar */}
      <nav style={{
        width: "100%",
        background: "#0070f3",
        padding: "18px 0 16px 0",
        marginBottom: 32,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/vercel.svg" alt="Copilot Logo" style={{ height: 32, width: 32, filter: "invert(1)" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Todo with Copilot</span>
        </div>
      </nav>
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "32px 24px 24px 24px",
          borderRadius: "18px",
          boxShadow: "0 6px 32px rgba(0,0,0,0.10)",
          background: "#fff",
          fontFamily: "Inter, sans-serif",
          width: "95%",
          minWidth: 0
        }}
      >
        <h2 style={{ textAlign: "center", color: "#222", fontWeight: 700, fontSize: 28, marginBottom: 24 }}>To-Do List</h2>
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "22px",
          alignItems: "center",
          flexWrap: "wrap"
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
              flex: 2,
              minWidth: 0,
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              fontSize: "16px",
              background: "#f9fafb",
              color: "#1a202c",
              marginBottom: "8px"
            }}
          />
          {/* Custom Dropdown for categories */}
          <div
            ref={dropdownRef}
            style={{ position: "relative", flex: 1, minWidth: 0, marginBottom: "8px" }}
          >
            <div
              onClick={openDropdown}
              style={{
                padding: "10px 8px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "16px",
                background: "#f9fafb",
                color: category ? "#222" : "#888",
                cursor: "pointer",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {category || "Select category"}
              </span>
              <span style={{ marginLeft: 8, fontSize: 18, color: "#888" }}>&#9662;</span>
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
                  background: "#fff",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
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
                        color: "#222",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #f3f4f6"
                      }}
                    >
                      {opt}
                    </div>
                  ) : (
                    <div
                      key={opt}
                      style={{
                        padding: "10px 12px",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #f3f4f6"
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
          {category === "Other" && (
            <input
              type="text"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              placeholder="Custom category"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "16px",
                background: "#f9fafb",
                marginBottom: "8px"
              }}
            />
          )}
          <button
            onClick={handleAdd}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              background: "#0070f3",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,112,243,0.08)",
              minWidth: 90
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
                borderBottom: idx !== todos.length - 1 ? "1px solid #e5e7eb" : "none",
                flexWrap: "wrap"
              }}
            >
              <span style={{ color: "#1a202c", flex: 1, fontSize: 17, wordBreak: "break-word" }}>
                {todo.text}
                {todo.category && (
                  <span style={{
                    background: "#e0e7ff",
                    color: "#3730a3",
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