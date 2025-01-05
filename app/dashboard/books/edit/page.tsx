"use client";
import { useSearchParams } from "next/navigation";
import { Book, doGetBookFromUser } from "../booksSlice";
import { BookForm } from "@/components/book/book-form/book-form";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/store_hooks";
import { doGetAllCollections } from "../../collections/collectionsSlice";
import { doGetAllLocations } from "../../locations/locationSlice";
import { Loader2 } from "lucide-react";

export default function BookEditingPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const getBookState = useAppSelector((state) => state.books.getBookSlice);

  useEffect(() => {
    if (getBookState.status !== "loading") {
      dispatch(
        doGetBookFromUser(Number.parseInt(searchParams.get("id") || ""))
      );
    }
  }, []);

  return (
    <main className="flex w-full h-full flex-col justify-center items-center">
      <div className="w-full flex justify-start items-center mb-7">
        <h1 className="font-serif font-semibold text-3xl">Editar Livro</h1>
        <div className="flex-grow"></div>
      </div>
      {getBookState != null &&
        getBookState.status != null &&
        getBookState.status === "success" && (
          <>
            <BookForm isEditing book={getBookState.book} />
          </>
        )}
      {getBookState != null &&
        getBookState.status != null &&
        getBookState.status === "loading" && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="mt-16 h-20 w-20 animate-spin" />
          </div>
        )}
      {(getBookState == null ||
        getBookState.status == null ||
        getBookState.status === "failure") && (
        <p className="">
          Houve uma falha ao tentar recuperar livro
          <br />
          {getBookState.errorMsg}
        </p>
      )}
    </main>
  );
}
