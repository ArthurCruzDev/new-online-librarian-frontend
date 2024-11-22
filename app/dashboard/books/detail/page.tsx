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

  useEffect(() => {
    if (
      getAllBooksState.status === "idle" ||
      getAllBooksState.status === "success"
    ) {
      dispatch(
        doGetAllBooksFromUser({
          page: 1,
          pageSize: 1,
        })
      );
    }
  }, []);

  const getBooks = useCallback(() => {
    return getAllBooksState.books
      .filter((book) => {
        if (search === "") {
          return true;
        }
        return book.title.toLowerCase().includes(search.toLowerCase());
      })
      .map<React.ReactElement>((book, index) => {
        return <BookComponent key={index} book={book} />;
      });
  }, [getAllBooksState.books, search]);

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
          <AddEditBook
            book={undefined}
            closeCallback={() => setDialogOpen(false)}
          />
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
          getAllBooksState.status === "success" &&
          getBooks()}
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

type BookComponentProps = {
  book: Book;
};

function BookComponent({ book }: BookComponentProps): React.ReactElement {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <Card className="w-[280px] my-0 mx-auto shadow-md">
      <CardHeader>{book.title}</CardHeader>
      <CardContent>
        <div className="w-full h-[138px] relative">
          <Image
            src={
              "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            }
            layout="fill"
            objectFit="cover"
            alt="book image"
            quality={75}
            priority={false}
          />
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-row justify-start align-middle gap-4">
        {/* <Button variant={"default"}>
          <Edit2 onClick={() => setEditDialogOpen(true)} />
        </Button> */}
        <Button
          variant={"destructive"}
          size={"icon"}
          onClick={() => {
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 />
        </Button>
      </CardFooter>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AddEditBook
          book={book}
          closeCallback={() => setEditDialogOpen(false)}
        />
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DeleteBook
          book={book}
          closeCallback={() => setDeleteDialogOpen(false)}
        />
      </Dialog>
    </Card>
  );
}

type AddEditBookProps = {
  book?: Book;
  closeCallback: Function;
};

export function AddEditBook({
  book,
  closeCallback,
}: AddEditBookProps): React.ReactElement {
  const [userId, setUserId] = useState(0);

  const dispatch = useAppDispatch();
  const createBookState = useAppSelector(
    (state) => state.books.createBookSlice
  );

  const formSchema = z.object({
    name: z.string().min(1).max(255),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    setUserId(getTokenData()?.id ?? 0);
    if (book != null && book != undefined) {
      form.setValue("name", book.title);
    }
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    let newBook: Book = {
      id: book?.id,
      title: values.name,
      authors: [
        {
          name: "Robson",
        },
      ],
      publisher: "",
      languages: [{ name: "PT-BR", code: "pt-br" }],
      location: {
        id: 0,
        name: "",
        user_id: 0,
      },
      user_id: book?.user_id ?? userId,
    };
    if (book?.id != undefined) {
      dispatch(doUpdateBook(newBook));
    } else {
      dispatch(doCreateBook(newBook));
    }
  }

  function closeAfterSuccess() {
    dispatch(
      doGetAllBooksFromUser({
        page: 1,
        pageSize: 10,
      })
    );
    dispatch(resetCreateBookState({}));
    closeCallback(true);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{book?.id == null ? "Criar" : "Editar"} Livro</DialogTitle>
      </DialogHeader>
      {createBookState?.status == "idle" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input id="bookName" className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {book?.id == null ? "Criar" : "Editar"}
            </Button>
          </form>
        </Form>
      )}
      {createBookState?.status == "failure" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input id="bookName" className="col-span-3" {...field} />
                  </FormControl>
                  {createBookState?.error && (
                    <FormDescription className="text-red-700 font-semibold">
                      {createBookState?.errorMsg}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {book?.id == null ? "Criar" : "Editar"}
            </Button>
          </form>
        </Form>
      )}
      {createBookState?.status == "loading" && (
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="my-8 h-20 w-20 animate-spin" />
        </div>
      )}
      {createBookState?.status == "success" && (
        <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
          <p className="font-medium text-lg">Livro criada com sucesso</p>
          <CheckCircle2 size={48} className="text-green-500" />
          <Button
            variant={"default"}
            onClick={closeAfterSuccess}
            className="mt-4"
          >
            Fechar
          </Button>
        </div>
      )}
      <DialogFooter></DialogFooter>
    </DialogContent>
  );
}

type DeleteBookProps = {
  book: Book;
  closeCallback: Function;
};

export function DeleteBook({
  book,
  closeCallback,
}: DeleteBookProps): React.ReactElement {
  const [userId, setUserId] = useState(0);

  const dispatch = useAppDispatch();
  const deleteBookState = useAppSelector(
    (state) => state.books.deleteBookSlice
  );

  useEffect(() => {
    setUserId(getTokenData()?.id ?? 0);
  }, []);

  function onSubmit() {
    dispatch(doDeleteBook(book));
  }

  function closeAfterSuccess() {
    dispatch(
      doGetAllBooksFromUser({
        page: 1,
        pageSize: 10,
      })
    );
    dispatch(resetDeleteBookState({}));
    closeCallback(true);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Remover Livro</DialogTitle>
      </DialogHeader>
      {(deleteBookState?.status == "idle" ||
        deleteBookState?.status == "failure") && (
        <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
          <p className="font-medium text-lg text-center">
            Confirma que deseja remover a coleção?
          </p>
          {deleteBookState?.status === "failure" && (
            <p className="font-normal text-md text-center text-red-700">
              {deleteBookState?.errorMsg}
            </p>
          )}
          <div className="flex flex-row justify-center items-start gap-16">
            <Button
              variant={"default"}
              onClick={() => {
                closeCallback(true);
              }}
              className="mt-4"
            >
              Cancelar
            </Button>
            <Button variant={"destructive"} onClick={onSubmit} className="mt-4">
              Remover
            </Button>
          </div>
        </div>
      )}
      {deleteBookState?.status == "loading" && (
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="my-8 h-20 w-20 animate-spin" />
        </div>
      )}
      {deleteBookState?.status == "success" && (
        <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
          <p className="font-medium text-lg">Livro removida com sucesso</p>
          <CheckCircle2 size={48} className="text-green-500" />
          <Button
            variant={"default"}
            onClick={closeAfterSuccess}
            className="mt-4"
          >
            Fechar
          </Button>
        </div>
      )}
      <DialogFooter></DialogFooter>
    </DialogContent>
  );
}
