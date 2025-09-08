import React, { useState } from "react";
import styles from "../../dashboard.module.css";
import { FaCheck, FaPen, FaUndo, FaTrash, FaEllipsisV } from "react-icons/fa";

export default function TodoCard({
  task,
  onEdit,
  onSaveEdit,
  editId,
  editValue,
  setEditValue,
  onDelete,
  onMarkAsDone,
  onUndoDone,
  onStart,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div key={task.id} className={styles.taskDetail} data-status={task.status}>
      {/* ...existing code for name, project, dates, status buttons... */}
      <h2
        style={{ cursor: "pointer" }}
        className={task.status === "Done" ? styles.doneText : undefined}
      >
        {task.name}
      </h2>
      <div className={styles.taskProject}>Category: {task.project}</div>
      {task.startDate && (
        <div className={styles.taskDate}>
          Start:{" "}
          {(() => {
            const d = new Date(task.startDate);
            const day = d.getDate().toString().padStart(2, "0");
            const month = (d.getMonth() + 1).toString().padStart(2, "0");
            const hour = d.getHours().toString().padStart(2, "0");
            const min = d.getMinutes().toString().padStart(2, "0");
            return `${day}/${month} ${hour}:${min}`;
          })()}
        </div>
      )}
      {task.status === "Done" && task.finishDate && (
        <div className={styles.taskDate}>
          Finished:{" "}
          {(() => {
            const d = new Date(task.finishDate);
            const day = d.getDate().toString().padStart(2, "0");
            const month = (d.getMonth() + 1).toString().padStart(2, "0");
            const hour = d.getHours().toString().padStart(2, "0");
            const min = d.getMinutes().toString().padStart(2, "0");
            return `${day}/${month} ${hour}:${min}`;
          })()}
        </div>
      )}
      {task.status !== "Done" && (
        <button
          className={styles.doneBtn}
          onClick={() => onMarkAsDone(task.id)}
        >
          <FaCheck style={{ fontSize: "1em" }} />
        </button>
      )}
      {task.status === "Done" && (
        <button
          className={styles.undoBtn}
          onClick={() => onUndoDone(task.id)}
          title="Undo"
        >
          <FaUndo style={{ fontSize: "1em" }} />
        </button>
      )}
      {/* Dropdown menu trigger */}
      <div style={{ position: "absolute", bottom: 8, right: 8 }}>
        <button
          className={styles.menuBtn}
          onClick={() => onEdit(task.id, task.name)}
          aria-label="Edit Todo"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.3em",
            color: "#aab6ff",
          }}
        >
          <FaEllipsisV />
        </button>
      </div>
    </div>
  );
}
