import React from "react";
import styles from "../../dashboard.module.css";
import { FaCheck, FaPen, FaUndo, FaTrash } from "react-icons/fa";

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
  return (
    <div key={task.id} className={styles.taskDetail} data-status={task.status}>
      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(task.id)}
        title="Delete"
        style={{ position: "absolute", top: 8, right: 8 }}
      >
        <FaTrash style={{ fontSize: "1em" }} />
      </button>
      {task.status !== "Done" && (
        <button
          className={styles.editBtn}
          onClick={() => onEdit(task.id, task.name)}
          title="Edit"
        >
          <FaPen style={{ fontSize: "1em" }} />
        </button>
      )}
      {/* Remove inline edit input, always show name */}
      <h2
        style={{ cursor: "pointer" }}
        className={task.status === "Done" ? styles.doneText : undefined}
      >
        {task.name}
      </h2>
      <div className={styles.taskProject}>Category: {task.project}</div>
      {task.startDate && (
        <div className={styles.taskDate}>
          Start: {new Date(task.startDate).toLocaleDateString()}{" "}
          {new Date(task.startDate).toLocaleTimeString()}
        </div>
      )}
      {task.status === "Done" && task.finishDate && (
        <div className={styles.taskDate}>
          Finished: {new Date(task.finishDate).toLocaleDateString()}{" "}
          {new Date(task.finishDate).toLocaleTimeString()}
        </div>
      )}
      {task.status === "In Progress" && (
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
      {task.status === "To Do" && (
        <button className={styles.doneBtn} onClick={() => onStart(task.id)}>
          Start
        </button>
      )}
    </div>
  );
}
