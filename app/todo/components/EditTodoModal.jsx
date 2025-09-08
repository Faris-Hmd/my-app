import React, { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";

export default function EditTodoModal({ show, onClose, onSave, todo }) {
  const [editValue, setEditValue] = useState(todo?.name || "");
  const [editProject, setEditProject] = useState(todo?.project || "");
  const [editPriority, setEditPriority] = useState(todo?.priority || "Normal");

  useEffect(() => {
    setEditValue(todo?.name || "");
    setEditProject(todo?.project || "");
    setEditPriority(todo?.priority || "Normal");
  }, [todo]);

  if (!show || !todo) return null;

  const handleSave = () => {
    if (!editValue.trim() || !editProject.trim()) return;
    onSave(todo.id, editValue, editProject, editPriority);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
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
          autoFocus
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
        <label className={styles.modalLabel} htmlFor="editTodoPriority">
          Priority
        </label>
        <select
          id="editTodoPriority"
          value={editPriority}
          onChange={(e) => setEditPriority(e.target.value)}
          className={styles.modalInput}
        >
          <option value="Low">Low</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
        </select>
        <button className={styles.saveBtn} onClick={handleSave}>
          Save
        </button>
        <button className={styles.cancelBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
