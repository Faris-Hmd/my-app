import React, { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";

export default function EditTodoModal({
  show,
  onClose,
  onSave,
  onDelete,
  todo,
}) {
  const [editValue, setEditValue] = useState(todo?.name || "");
  const [editProject, setEditProject] = useState(todo?.project || "");
  const [editDate, setEditDate] = useState(
    todo?.startDate ? todo.startDate.slice(0, 16) : ""
  );

  useEffect(() => {
    setEditValue(todo?.name || "");
    setEditProject(todo?.project || "");
    setEditDate(todo?.startDate ? todo.startDate.slice(0, 16) : "");
  }, [todo]);

  if (!show || !todo) return null;

  const handleSave = () => {
    if (!editValue.trim() || !editProject.trim()) return;
    onSave(todo.id, editValue, editProject, editDate);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.modalCloseBtn}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <button
          className={styles.modalDeleteFloatBtn}
          onClick={() => onDelete(todo.id)}
          aria-label="Delete Todo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 3v1H4v2h16V4h-5V3H9zm-4 6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9H5zm2 2h2v8H7v-8zm4 0h2v8h-2v-8z" />
          </svg>
        </button>
        <h3>Edit Todo</h3>
        <label className={styles.modalLabel} htmlFor="editTodoName">
          Todo Name
        </label>
        <input
          id="editTodoName"
          type="text"
          placeholder="Todo name"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={styles.modalInput}
          // autoFocus
        />
        <label className={styles.modalLabel} htmlFor="editTodoProject">
          Project
        </label>
        <select
          id="editTodoProject"
          value={editProject}
          onChange={(e) => setEditProject(e.target.value)}
          className={styles.modalInput}
        >
          <option value="">Select a project</option>
          <option value="Personal">Personal</option>
          <option value="Work">Work</option>
          <option value="Learning">Learning</option>
          <option value="Finance">Finance</option>
        </select>
        <label className={styles.modalLabel} htmlFor="editTodoDate">
          Date
        </label>
        <input
          id="editTodoDate"
          type="datetime-local"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          className={styles.modalInput}
        />
        <button className={styles.saveBtn} onClick={handleSave}>
          Save
        </button>
        {/* ...existing code... */}
      </div>
    </div>
  );
}
