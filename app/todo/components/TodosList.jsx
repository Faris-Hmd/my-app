import React, { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import TodoCard from "./TodoCard";
import EditTodoModal from "./EditTodoModal";

function getCategoryProgress(todos, category) {
  const all = todos.filter((t) => (t.project || "Other") === category);
  const done = all.filter((t) => t.status === "Done");
  const percent = all.length ? Math.round((done.length / all.length) * 100) : 0;
  return percent;
}
function getBarClass(category) {
  return (
    styles.categoryProgressBar +
    " " +
    (category === "Personal"
      ? styles.catPersonalBar
      : category === "Work"
      ? styles.catWorkBar
      : category === "Learning"
      ? styles.catLearningBar
      : category === "Finance"
      ? styles.catFinanceBar
      : styles.catOtherBar)
  );
}

const TODOS_KEY = "todos-list";
function getLocalTodos() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  const raw = localStorage.getItem(TODOS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveLocalTodos(todos) {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export default function TodosList() {
  const [todoState, setTodoState] = useState({ undone: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  const fetchTodos = () => {
    setLoading(true);
    const todosArr = getLocalTodos();
    setTodoState({
      undone: todosArr.filter((t) => t.status !== "Done"),
      done: todosArr.filter((t) => t.status === "Done"),
    });
    setLoading(false);
  };
  useEffect(() => {
    fetchTodos();
  }, []);

  const markAsDone = (id) => {
    const todos = getLocalTodos().map((t) =>
      t.id === id
        ? { ...t, status: "Done", finishDate: new Date().toISOString() }
        : t
    );
    saveLocalTodos(todos);
    fetchTodos();
  };
  const undoDone = (id) => {
    const todos = getLocalTodos().map((t) =>
      t.id === id ? { ...t, status: "Undone" } : t
    );
    saveLocalTodos(todos);
    fetchTodos();
  };
  const startEdit = (id, name) => {
    setEditTodo(allTodos.find((t) => t.id === id));
    setShowEditModal(true);
  };
  const saveEdit = (id, newName, newProject, newDate) => {
    const todos = getLocalTodos().map((t) =>
      t.id === id
        ? { ...t, name: newName, project: newProject, startDate: newDate }
        : t
    );
    saveLocalTodos(todos);
    setShowEditModal(false);
    setEditTodo(null);
    fetchTodos();
  };
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = () => {
    if (deleteId) {
      const todos = getLocalTodos().filter((t) => t.id !== deleteId);
      saveLocalTodos(todos);
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

  // Show todos in newest-to-oldest order from localStorage
  const allTodos = getLocalTodos().sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
    const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
    return dateB - dateA;
  });

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

  // Progress bars for each category
  const categories = ["Personal", "Work", "Learning", "Finance", "Other"];

  return (
    <section className={styles.todosList}>
      {Object.entries(groupByDate).map(([label, todos]) => (
        <React.Fragment key={label}>
          <div
            style={{
              fontWeight: 600,
              fontSize: ".8em",
              margin: "8px 0 8px 0",
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
              onStart={() => {}}
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
