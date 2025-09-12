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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginLeft: 6,
          }}
        >
          <input
            type="checkbox"
            checked={task.status === "Done"}
            onChange={() =>
              task.status === "Done"
                ? onUndoDone(task.id)
                : onMarkAsDone(task.id)
            }
            className={styles.todoCheckbox}
          />
          <div>
            <h2
              style={{ cursor: "pointer", margin: "5px 0" }}
              className={task.status === "Done" ? styles.doneText : undefined}
            >
              {task.name}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                className={
                  styles.taskProject +
                  " " +
                  (task.project ? styles["cat" + task.project] : "")
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "60px",
                  padding: "2px 12px",
                  borderRadius: "16px",
                  fontSize: "0.95em",
                  fontWeight: 500,
                  color: "#fff",
                  background:
                    task.project === "Personal"
                      ? "#6c63ff"
                      : task.project === "Work"
                      ? "#00bcd4"
                      : task.project === "Learning"
                      ? "#4caf50"
                      : task.project === "Finance"
                      ? "#ff9800"
                      : "#888",
                }}
              >
                {task.project}
              </span>
              {/* {task.startDate && (
                <span className={styles.taskDate}>
                  {(() => {
                    const d = new Date(task.startDate);
                    const day = d.getDate().toString().padStart(2, "0");
                    const month = (d.getMonth() + 1)
                      .toString()
                      .padStart(2, "0");
                    const hour = d.getHours().toString().padStart(2, "0");
                    const min = d.getMinutes().toString().padStart(2, "0");
                    return `${day}/${month} ${hour}:${min}`;
                  })()}
                </span>
              )} */}
              {task.status === "Done" && task.finishDate && (
                <span className={styles.taskDate}>
                  |&nbsp; Finshed in :
                  {(() => {
                    const d = new Date(task.finishDate);
                    const day = d.getDate().toString().padStart(2, "0");
                    const month = (d.getMonth() + 1)
                      .toString()
                      .padStart(2, "0");
                    const hour = d.getHours().toString().padStart(2, "0");
                    const min = d.getMinutes().toString().padStart(2, "0");
                    return ` ${day}/${month} ${hour}:${min}`;
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          className={styles.editBtn}
          onClick={() => onEdit(task.id, task.name)}
          aria-label="Edit Todo"
        >
          <FaPen />
        </button>
      </div>
    </div>
  );
}
