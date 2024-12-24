"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/store_hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  doCreateBook,
  doDeleteBook,
  doGetAllBooksFromUser,
  doUpdateBook,
  Book,
  resetCreateBookState,
  resetDeleteBookState,
} from "../booksSlice";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import styles from "./styles.module.css";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getTokenData } from "@/lib/api_client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function BooksPage() {
  const dispatch = useAppDispatch();
  const getAllBooksState = useAppSelector(
    (state) => state.books.getAllBooksSlice
  );
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const debouncedResults = useMemo(() => {
    return debounce(handleSearchChange, 200);
  }, []);
  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  return (
    <main className="flex w-full h-full flex-col justify-center items-center">
      <div className="w-full flex justify-start items-center mb-7">
        <h1 className="font-serif font-semibold text-3xl">Livros</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size={"sm"}
              className="ml-5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus />
            </Button>
          </DialogTrigger>
        </Dialog>
        <div className="flex-grow"></div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Search className="relative left-9 text-gray-500" size={"24px"} />
          <Input
            className="pl-8"
            type="text"
            placeholder="Buscar"
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className={styles.grid + " w-full h-full"}>
        {(getAllBooksState == null ||
          getAllBooksState.status == null ||
          getAllBooksState.status === "idle") && (
          <p className="">
            Você não possui nenhuma coleção cadastrada no momento.
            <br />
            Clique no botão <strong>+</strong> para criar uma nova coleção.
          </p>
        )}
        {getAllBooksState != null &&
          getAllBooksState.status != null &&
          getAllBooksState.status === "success" && <></>}
        {getAllBooksState != null &&
          getAllBooksState.status != null &&
          getAllBooksState.status === "loading" && (
            <div className="flex w-full h-full justify-center items-center">
              <Loader2 className="mt-16 h-20 w-20 animate-spin" />
            </div>
          )}
        {(getAllBooksState == null ||
          getAllBooksState.status == null ||
          getAllBooksState.status === "failure") && (
          <p className="">
            Houve uma falha ao tentar recuperar seus livros
            <br />
            {getAllBooksState.errorMsg}
          </p>
        )}
      </div>
    </main>
  );
}
