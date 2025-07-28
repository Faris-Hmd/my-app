// Firestore categories collection helper
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const addCategory = async (name) => {
  return await addDoc(collection(db, "categories"), { name });
};

export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map(doc => doc.data().name);
};
