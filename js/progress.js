import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs,
  orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { updateBook } from "./books.js";

// agregar entrada de progreso y actualizar el libro
export async function logProgress(bookId, { type, value, note = null }) {
  // guardar en historial
  const progressCol = collection(db, "books", bookId, "progress");
  await addDoc(progressCol, {
    type,           // "pages" | "percentage"
    value,          // número de página o % (0-100)
    note,
    date: serverTimestamp(),
  });

  // actualizar campo actual en el libro
  const field = type === "pages" ? "current_page" : "current_pct";
  await updateBook(bookId, { [field]: value });
}

// obtener historial completo de un libro
export async function getProgress(bookId) {
  const progressCol = collection(db, "books", bookId, "progress");
  const q = query(progressCol, orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}