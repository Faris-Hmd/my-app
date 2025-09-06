import React, { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import TodoCard from "./TodoCard";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/db/firebase";

export default function TodosList() {
  const [todoState, setTodoState] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const fetchTodos = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "todos"));
    const todosArr = [];
    querySnapshot.forEach((doc) => {
      todosArr.push({ id: doc.id, ...doc.data() });
    });
    setTodoState({
      todo: todosArr.filter((t) => t.status === "To Do"),
      inProgress: todosArr.filter((t) => t.status === "In Progress"),
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
    await updateDoc(doc(db, "todos", id), { status: "In Progress" });
    fetchTodos();
  };
  const startEdit = (id, name) => {
    setEditId(id);
    setEditValue(name);
  };
  const saveEdit = async (id) => {
    await updateDoc(doc(db, "todos", id), { name: editValue });
    setEditId(null);
    setEditValue("");
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
      setDeleteId(null);
      fetchTodos();
    }
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const allTodos = [
    ...todoState.todo.map((t) => ({ ...t, status: "To Do" })),
    ...todoState.inProgress.map((t) => ({ ...t, status: "In Progress" })),
    ...todoState.done.map((t) => ({ ...t, status: "Done" })),
  ];

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

  return (
    <section className={styles.todosList}>
      {allTodos.map((task) => (
        <TodoCard
          key={task.id}
          task={task}
          onEdit={startEdit}
          onSaveEdit={saveEdit}
          editId={editId}
          editValue={editValue}
          setEditValue={setEditValue}
          onDelete={handleDeleteClick}
          onMarkAsDone={markAsDone}
          onUndoDone={undoDone}
          onStart={async (id) => {
            await updateDoc(doc(db, "todos", id), { status: "In Progress" });
            fetchTodos();
          }}
        />
      ))}
      {/* Warning Modal for Delete */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Are you sure you want to delete this todo?</h3>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className={styles.saveBtn} onClick={confirmDelete}>
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
