import React, { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import TodoCard from "./TodoCard";
import EditTodoModal from "./EditTodoModal";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/db/firebase";

export default function TodosList() {
  const [todoState, setTodoState] = useState({
    undone: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  const fetchTodos = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "todos"));
    const todosArr = [];
    querySnapshot.forEach((doc) => {
      todosArr.push({ id: doc.id, ...doc.data() });
    });
    setTodoState({
      undone: todosArr.filter((t) => t.status !== "Done"),
      done: todosArr.filter((t) => t.status === "Done"),
    });
    setLoading(false);
  };
  useEffect(() => {
    fetchTodos();
  }, []);

  const markAsDone = async (id) => {
    await updateDoc(doc(db, "todos", id), {
      status: "Done",
      finishDate: new Date().toISOString(),
    });
    fetchTodos();
  };
  const undoDone = async (id) => {
    await updateDoc(doc(db, "todos", id), { status: "Undone" });
    fetchTodos();
  };
  const startEdit = (id, name) => {
    setEditTodo(allTodos.find((t) => t.id === id));
    setShowEditModal(true);
  };
  const saveEdit = async (id, newName, newProject, newDate) => {
    await updateDoc(doc(db, "todos", id), {
      name: newName,
      project: newProject,
      startDate: newDate,
    });
    setShowEditModal(false);
    setEditTodo(null);
    fetchTodos();
  };
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (deleteId) {
      await import("firebase/firestore").then(({ doc, deleteDoc }) =>
        deleteDoc(doc(db, "todos", deleteId))
      );
      setShowDeleteModal(false);
      setShowEditModal(false);
      setEditTodo(null);
      setDeleteId(null);
      fetchTodos();
    }
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const undoneSorted = [...todoState.undone]
    .map((t) => ({ ...t, status: "Undone" }))
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
      const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
      return dateB - dateA;
    });
  const doneSorted = [...todoState.done]
    .map((t) => ({ ...t, status: "Done" }))
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
      const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
      return dateB - dateA;
    });
  const allTodos = [...undoneSorted, ...doneSorted];

  if (loading)
    return (
      <div className={styles.todosList}>
        <div className={styles.spinner}>
          <div className={styles["spinner-ball"]}></div>
          <div className={styles["spinner-ball"]}></div>
          <div className={styles["spinner-ball"]}></div>
        </div>
      </div>
    );

  // Group todos by date string (dd/mm/yyyy)
  const groupByDate = {};
  allTodos.forEach((todo) => {
    const d = todo.startDate ? new Date(todo.startDate) : null;
    let label = "Other";
    if (d) {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const dd = d.getDate().toString().padStart(2, "0");
      const mm = (d.getMonth() + 1).toString().padStart(2, "0");
      const yyyy = d.getFullYear();
      const dateStr = `${dd}/${mm}/${yyyy}`;
      const todayStr = `${today.getDate().toString().padStart(2, "0")}/${(
        today.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${today.getFullYear()}`;
      const tomorrowStr = `${tomorrow.getDate().toString().padStart(2, "0")}/${(
        tomorrow.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${tomorrow.getFullYear()}`;
      if (dateStr === todayStr) label = "Today";
      else if (dateStr === tomorrowStr) label = "Tomorrow";
      else label = dateStr;
    }
    if (!groupByDate[label]) groupByDate[label] = [];
    groupByDate[label].push(todo);
  });

  return (
    <section className={styles.todosList}>
      {Object.entries(groupByDate).map(([label, todos]) => (
        <React.Fragment key={label}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "1.1em",
              margin: "16px 0 8px 0",
              color: "#6c63ff",
            }}
          >
            {label}
          </div>
          {todos.map((task) => (
            <TodoCard
              key={task.id}
              task={task}
              onEdit={startEdit}
              onDelete={handleDeleteClick}
              onMarkAsDone={markAsDone}
              onUndoDone={undoDone}
              onStart={async (id) => {
                await updateDoc(doc(db, "todos", id), {
                  status: "In Progress",
                });
                fetchTodos();
              }}
            />
          ))}
        </React.Fragment>
      ))}
      {/* Edit Modal for Todo */}
      <EditTodoModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditTodo(null);
        }}
        onSave={saveEdit}
        onDelete={handleDeleteClick}
        todo={editTodo}
      />
      {/* Warning Modal for Delete */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Are you sure you want to delete this todo?</h3>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className={styles.dangerBtn} onClick={confirmDelete}>
                Delete
              </button>
              <button className={styles.cancelBtn} onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
