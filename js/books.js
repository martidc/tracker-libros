import { db } from "./firebase.js";
import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const booksCol = collection(db, "books");

// agregar libro
export async function addBook(bookData) {
  return await addDoc(booksCol, {
    // datos de Open Library
    title:          bookData.title,
    author:         bookData.author,
    cover_url:      bookData.cover_url     ?? null,
    total_pages:    bookData.total_pages   ?? null,
    isbn:           bookData.isbn          ?? null,
    published_year: bookData.published_year ?? null,
    language:       bookData.language      ?? null,

    // datos personales
    status:         bookData.status ?? "want_to_read",
    progress_type:  bookData.progress_type ?? "pages",
    current_page:   null,
    current_pct:    null,
    review:         "",
    date_started:   null,
    date_finished:  null,

    // metadata
    added_at:    serverTimestamp(),
    updated_at:  serverTimestamp(),
  });
}

// obtener todos los libros, con filtros opcionales
export async function getBooks({ status, language } = {}) {
  let q = booksCol;
  const filters = [];

  if (status)   filters.push(where("status", "==", status));
  if (language) filters.push(where("language", "==", language));
  filters.push(orderBy("added_at", "desc"));

  q = query(booksCol, ...filters);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// obtener un libro por ID
export async function getBook(id) {
  const snap = await getDoc(doc(db, "books", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// actualizar campos de un libro
export async function updateBook(id, fields) {
  await updateDoc(doc(db, "books", id), {
    ...fields,
    updated_at: serverTimestamp(),
  });
}

// eliminar libro
export async function deleteBook(id) {
  await deleteDoc(doc(db, "books", id));
}