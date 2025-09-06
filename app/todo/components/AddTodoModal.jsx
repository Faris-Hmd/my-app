import React, { useState } from "react";
import styles from "../../dashboard.module.css";

export default function AddTodoModal({ show, onClose, onAdd }) {
  const [newTodo, setNewTodo] = useState({
    name: "",
    project: "",
    priority: "Normal",
  });

  const handleSave = async () => {
    if (!newTodo.name || !newTodo.project) return;
    await onAdd({
      ...newTodo,
      startDate: new Date().toISOString(),
      created: new Date().toISOString(),
    });
    setNewTodo({ name: "", project: "", priority: "Normal" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
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
        <label className={styles.modalLabel} htmlFor="todoPriority">
          Priority
        </label>
        <select
          id="todoPriority"
          value={newTodo.priority}
          onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
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
