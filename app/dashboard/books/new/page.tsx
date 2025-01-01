"use client";
import { BookForm } from "@/components/book/book-form/book-form";

export default function BooksPage() {
  return (
    <main className="flex w-full h-full flex-col justify-center items-center">
      <div className="w-full flex justify-start items-center mb-7">
        <h1 className="font-serif font-semibold text-3xl">Cadastrar Livro</h1>
        <div className="flex-grow"></div>
      </div>
      <BookForm />
    </main>
  );
}
