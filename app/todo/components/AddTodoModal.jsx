import React, { useState } from "react";
import styles from "../../dashboard.module.css";

export default function AddTodoModal({ show, onClose, onAdd }) {
  const [newTodo, setNewTodo] = useState({
    name: "",
    project: "",
  });

  const handleSave = async () => {
    if (!newTodo.name || !newTodo.project) return;
    await onAdd({
      ...newTodo,
      startDate: new Date().toISOString(),
      created: new Date().toISOString(),
    });
    setNewTodo({ name: "", project: "" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            fontSize: "1.6rem",
            color: "#fff",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          &times;
        </button>
        <h3>Add New Todo</h3>
        <label className={styles.modalLabel} htmlFor="todoName">
          Todo Name
        </label>
        <input
          id="todoName"
          type="text"
          placeholder="Todo name"
          value={newTodo.name}
          onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
          className={styles.modalInput}
          autoFocus
        />
        <label className={styles.modalLabel} htmlFor="todoProject">
          Project
        </label>
        <select
          id="todoProject"
          value={newTodo.project}
          onChange={(e) => setNewTodo({ ...newTodo, project: e.target.value })}
          className={styles.modalInput}
        >
          <option value="">Select a project</option>
          <option value="Personal">Personal</option>
          <option value="Work">Work</option>
          <option value="Learning">Learning</option>
          <option value="Finance">Finance</option>
        </select>
        {/* Priority removed */}
        <button className={styles.saveBtn} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
