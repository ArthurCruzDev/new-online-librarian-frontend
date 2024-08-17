import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livros - Online Librarian",
  description: "Livros - Online Librarian",
};
export default function BooksPage() {
  return (
    <main className="flex w-100 h-100">
      <h1>Books</h1>
    </main>
  );
}
