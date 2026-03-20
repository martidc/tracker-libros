import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getBooks } from "./books.js";

// recalcula y guarda el resumen
export async function refreshStats() {
  const books = await getBooks();

  const stats = {
    total_read:    0,
    total_reading: 0,
    total_want:    0,
    books_by_lang: {},
    updated_at:    serverTimestamp(),
  };

  for (const book of books) {
    if (book.status === "read")          stats.total_read++;
    if (book.status === "reading")       stats.total_reading++;
    if (book.status === "want_to_read")  stats.total_want++;

    if (book.language) {
      stats.books_by_lang[book.language] =
        (stats.books_by_lang[book.language] ?? 0) + 1;
    }
  }

  await setDoc(doc(db, "stats", "summary"), stats);
  return stats;
}

// leer el resumen guardado
export async function getStats() {
  const snap = await getDoc(doc(db, "stats", "summary"));
  return snap.exists() ? snap.data() : null;
}
