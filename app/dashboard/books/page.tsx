"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/store_hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import booksSlice, {
  doDeleteBook,
  doGetAllBooksFromUser,
  Book,
  resetDeleteBookState,
  GetAllBooksFromUserParams,
} from "./booksSlice";
import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle2,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import styles from "./styles.module.css";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTokenData } from "@/lib/api_client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { doGetAllCollections } from "../collections/collectionsSlice";
import { doGetAllLocations } from "../locations/locationSlice";
import { listenerCount } from "process";

const BOOK_COMPONENT_WIDTH = 280;

export default function BooksPage() {
  //Hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const getAllBooksState = useAppSelector(
    (state) => state.books.getAllBooksSlice
  );
  const getAllCollectionsState = useAppSelector(
    (state) => state.collections.getAllCollectionsSlice
  );
  const getAllLocationsState = useAppSelector(
    (state) => state.locations.getAllLocationsSlice
  );

  //States
  const [listParams, setListParams] = useState<GetAllBooksFromUserParams>({
    page: 0,
    pageSize: 0,
    query: undefined,
    collection_id: undefined,
    location_id: undefined,
  });

  //useMemos
  const debouncedSearch = useMemo(() => debounce(setListParams, 300), []);
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  });

  //useCallbacks
  const getBooks = useCallback(() => {
    return getAllBooksState.books.map<React.ReactElement>((book, index) => {
      return (
        <BookComponent
          key={index}
          book={book}
          listBooksParams={listParams}
          goToBookDetail={goToBookDetail}
          goToBookEditing={goToBookEditing}
        />
      );
    });
  }, [getAllBooksState.books]);

  const getMiddlePagination = useCallback(() => {
    const totalPages = Math.ceil(
      getAllBooksState.totalItems / listParams.pageSize
    );
    const paginationItems = [];

    for (let i = 0; i <= 7; i++) {
      let pageNumber = 0;
      if (i <= 3) {
        if (getAllBooksState.currentPage + i - 4 > totalPages) {
          break;
        }
        pageNumber = getAllBooksState.currentPage - 3 + i;
        if (pageNumber < 1) {
          continue;
        }
        if (
          pageNumber ==
            totalPages - (totalPages - getAllBooksState.currentPage) &&
          totalPages - getAllBooksState.currentPage <= 2 &&
          totalPages > 3
        ) {
          paginationItems.push(
            <PaginationItem key={`start-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
      } else if (i == 4) {
        if (getAllBooksState.currentPage + i - 1 > totalPages) {
          continue;
        }
        paginationItems.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
        continue;
      } else {
        if (getAllBooksState.currentPage + i - 4 > totalPages) {
          continue;
        }
        pageNumber = getAllBooksState.currentPage - 3 + (i - 1);
      }
      paginationItems.push(
        <PaginationItem key={`end-${i}`}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(pageNumber));
              router.push(pathname + "?" + params.toString());
            }}
            isActive={getAllBooksState.currentPage === pageNumber}
          >
            {pageNumber}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return paginationItems;
  }, [getAllBooksState.status]);

  //Functions
  function calcPageSizeBasedOnWidth(width: number): number {
    return Math.floor((width / (BOOK_COMPONENT_WIDTH + 20)) * 1);
  }

  function refreshBooks(params: GetAllBooksFromUserParams) {
    if (params.page === 0) {
      return;
    } else if (params.pageSize === 0) {
      const newState = {
        ...listParams,
        pageSize: calcPageSizeBasedOnWidth(window.innerWidth),
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      };
      setListParams(newState);
      return;
    }
    dispatch(doGetAllBooksFromUser(params));
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch((oldValue) => ({
      ...oldValue,
      page: 1,
      query: e.target.value,
    }));
  };

  function goToBookDetail(id?: number) {
    router.push("books/detail?id=" + id);
  }
  function goToBookEditing(id?: number) {
    router.push("books/edit?id=" + id);
  }

  //useEffects

  useEffect(() => {
    refreshBooks(listParams);
  }, [listParams]);

  useEffect(() => {
    dispatch(doGetAllCollections());
    dispatch(doGetAllLocations());
    if (getAllBooksState.status === "idle") {
      const newState = {
        ...listParams,
        pageSize: calcPageSizeBasedOnWidth(window.innerWidth),
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      };
      setListParams(newState);
    }
  }, []);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam != undefined && Number(pageParam) != listParams.page) {
      setListParams((oldState) => ({
        ...oldState,
        page: Number(pageParam),
      }));
    }
  }, [searchParams]);

  return (
    <main className="flex w-full h-full flex-col justify-center items-center">
      <div className="w-full flex justify-start items-center mb-7">
        <h1 className="font-serif font-semibold text-3xl">Livros</h1>
        <Button
          variant="default"
          size={"sm"}
          className="ml-5"
          onClick={() => router.push("books/new")}
        >
          <Plus />
        </Button>
        <div className="flex-grow"></div>
        <div className="flex w-full max-w-72 items-center space-x-2 mr-5">
          <div className="w-full flex flex-col">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !listParams.location_id && "text-muted-foreground"
                  )}
                >
                  <span className="w-11/12 text-left overflow-clip">
                    {listParams.location_id !== undefined
                      ? getAllLocationsState.locations.find(
                          (location) => location.id === listParams.location_id
                        )?.name
                      : "Selecione a Localização"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar Coleções..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma localização encontrada</CommandEmpty>
                    <CommandGroup>
                      {getAllLocationsState.locations.map((location) => (
                        <CommandItem
                          value={location.name}
                          key={location.id}
                          onSelect={() => {
                            if (listParams.location_id === location.id) {
                              setListParams((oldValue) => ({
                                ...oldValue,
                                location_id: undefined,
                              }));
                            } else {
                              setListParams((oldValue) => ({
                                ...oldValue,
                                location_id: location.id,
                              }));
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              listParams.location_id === location.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {location.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex w-full max-w-72 items-center space-x-2 mr-5">
          <div className="w-full flex flex-col">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !listParams.collection_id && "text-muted-foreground"
                  )}
                >
                  <span className="w-11/12 text-left overflow-clip">
                    {listParams.collection_id !== undefined
                      ? getAllCollectionsState.collections.find(
                          (collection) =>
                            collection.id === listParams.collection_id
                        )?.name
                      : "Selecione a Coleção"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar Coleções..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma coleção encontrada</CommandEmpty>
                    <CommandGroup>
                      {getAllCollectionsState.collections.map((collection) => (
                        <CommandItem
                          value={collection.name}
                          key={collection.id}
                          onSelect={() => {
                            if (listParams.collection_id === collection.id) {
                              setListParams((oldValue) => ({
                                ...oldValue,
                                collection_id: undefined,
                              }));
                            } else {
                              setListParams((oldValue) => ({
                                ...oldValue,
                                collection_id: collection.id,
                              }));
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              listParams.collection_id === collection.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {collection.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex w-full max-w-96 items-center relative">
          <Search className="absolute left-1 text-gray-500" size={"24px"} />
          <Input
            className="pl-8"
            type="text"
            placeholder="Buscar"
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="w-full h-full">
        {(getAllBooksState == null ||
          getAllBooksState.status == null ||
          getAllBooksState.status === "idle") && (
          <p className="">
            Você não possui nenhum livro cadastrado no momento.
            <br />
            Clique no botão <strong>+</strong> para criar um novo livro.
          </p>
        )}
        {getAllBooksState != null &&
          getAllBooksState.status != null &&
          getAllBooksState.status === "success" && (
            <>
              <div className={styles.grid + " w-full h-full"}>{getBooks()}</div>
              <div className="w-full mt-5">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          const params = new URLSearchParams(
                            searchParams.toString()
                          );
                          params.set("page", "1");
                          router.push(pathname + "?" + params.toString());
                        }}
                      >
                        <ChevronFirst className="h-4 w-4" />
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          if (getAllBooksState.currentPage > 1) {
                            const params = new URLSearchParams(
                              searchParams.toString()
                            );
                            params.set(
                              "page",
                              String(getAllBooksState.currentPage - 1)
                            );
                            router.push(pathname + "?" + params.toString());
                          }
                        }}
                      >
                        <ChevronLeft
                          className="h-4 w-4"
                          opacity={getAllBooksState.currentPage > 1 ? 1 : 0.3}
                        />
                      </PaginationLink>
                    </PaginationItem>
                    {getMiddlePagination()}
                    <PaginationItem>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          if (
                            getAllBooksState.currentPage <
                            Math.ceil(
                              getAllBooksState.totalItems / listParams.pageSize
                            )
                          ) {
                            const params = new URLSearchParams(
                              searchParams.toString()
                            );
                            params.set(
                              "page",
                              String(getAllBooksState.currentPage + 1)
                            );
                            router.push(pathname + "?" + params.toString());
                          }
                        }}
                      >
                        <ChevronRight
                          className="h-4 w-4"
                          opacity={
                            getAllBooksState.currentPage <
                            Math.ceil(
                              getAllBooksState.totalItems / listParams.pageSize
                            )
                              ? 1
                              : 0.3
                          }
                        />
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          const params = new URLSearchParams(
                            searchParams.toString()
                          );
                          params.set(
                            "page",
                            String(
                              Math.ceil(
                                getAllBooksState.totalItems /
                                  listParams.pageSize
                              )
                            )
                          );
                          router.push(pathname + "?" + params.toString());
                        }}
                      >
                        <ChevronLast className="h-4 w-4" />
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
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
  listBooksParams: GetAllBooksFromUserParams;
  goToBookDetail: (id?: number) => void;
  goToBookEditing: (id?: number) => void;
};

function BookComponent({
  book,
  listBooksParams,
  goToBookDetail,
  goToBookEditing,
}: BookComponentProps): React.ReactElement {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <Card className={`w-[${BOOK_COMPONENT_WIDTH}px] my-0 mx-auto shadow-md`}>
      <CardHeader className="h-40" onClick={() => goToBookDetail(book.id)}>
        <CardTitle>
          {book.title.length <= 55
            ? book.title
            : book.title.substring(0, 53) + "..."}
        </CardTitle>
        <CardDescription>
          {book.authors
            ?.map((author) => author.name)
            ?.reduce((prev, current) => `${prev}, ${current}`)}
        </CardDescription>
      </CardHeader>
      <CardContent onClick={() => goToBookDetail(book.id)}>
        <div className="w-full h-[300px] relative">
          <Image
            src={
              book.cover === undefined ||
              book.cover === "" ||
              book.cover === null
                ? "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781787550360/classic-book-cover-foiled-journal-9781787550360_hr.jpg"
                : book.cover
            }
            style={{
              objectFit: "cover",
            }}
            fill
            alt="book image"
            quality={75}
            priority={false}
          />
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-row justify-start align-middle gap-4 z-10">
        <Button
          variant={"default"}
          size={"icon"}
          onClick={() => goToBookEditing(book.id)}
        >
          <Edit2 />
        </Button>
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DeleteBook
          book={book}
          closeCallback={() => setDeleteDialogOpen(false)}
          listBooksParams={listBooksParams}
        />
      </Dialog>
    </Card>
  );
}

type DeleteBookProps = {
  book: Book;
  closeCallback: Function;
  listBooksParams: GetAllBooksFromUserParams;
};

function DeleteBook({
  book,
  closeCallback,
  listBooksParams,
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
    dispatch(doGetAllBooksFromUser(listBooksParams));
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
            Confirma que deseja remover o livro?
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
          <p className="font-medium text-lg">Livro removido com sucesso</p>
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
