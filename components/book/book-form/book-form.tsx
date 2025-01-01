"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/store_hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  doCreateBook,
  resetCreateBookState,
  CreateBookDTO,
  Book,
  doUpdateBook,
  getBookSlice,
  resetUpdateBookState,
} from "../../../app/dashboard/books/booksSlice";
import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle2,
  ChevronsUpDown,
  CircleX,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getTokenData } from "@/lib/api_client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import Webcam from "react-webcam";
import { Label } from "@/components/ui/label";
import collectionsSlice, {
  doGetAllCollections,
} from "../../../app/dashboard/collections/collectionsSlice";
import { doGetAllLocations } from "../../../app/dashboard/locations/locationSlice";
import languages from "@/app/dashboard/books/languages";
import genres from "@/app/dashboard/books/genres";

type BookFormProperties = {
  book?: Book;
  isEditing?: boolean;
};

const formDefaultValues = {
  name: "",
  authors: [],
  languages: [],
  publisher: "",
  edition: "",
  isbn: "",
  year: "",
  genres: [],
  cover: "",
  collection_id: undefined,
  location_id: undefined,
};

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const formSchema = z.object({
  name: z.string().min(1).max(255),
  authors: z.array(
    z.object({
      name: z.string().min(1).max(255),
      url: z
        .string()
        .max(500)
        .nullish()
        .transform((a) => (a === null ? undefined : a)),
    })
  ),
  languages: z.array(
    z.object({
      name: z.string().min(1).max(255),
      code: z.string().max(4).optional(),
    })
  ),
  publisher: z.string().min(1).max(500),
  edition: z
    .string()
    .regex(/^\d+$/, "somente números são aceitos")
    .max(50)
    .optional(),
  isbn: z
    .string()
    .regex(/^\d+$/, "somente números são aceitos")
    .min(10)
    .max(14)
    .optional(),
  year: z
    .string()
    .regex(/^\d+$/, "somente números são aceitos")
    .max(4)
    .optional(),
  genres: z.array(
    z.object({
      name: z.string().min(1).max(255),
    })
  ),
  cover: z.string().or(z.string().url()).or(z.string().base64()).nullish(),
  collection_id: z
    .number()
    .positive()
    .int()
    .nullish()
    .transform((a) => (a === null ? undefined : a)),
  location_id: z.number().int().positive(),
});

const BookForm = ({ book, isEditing = false }: BookFormProperties) => {
  //Hooks
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => {
      if (book !== undefined) {
        console.log(book.authors);
        return {
          name: book.title,
          authors: book.authors,
          languages: book.languages,
          publisher: book.publisher,
          edition: book.edition,
          isbn: book.isbn,
          year: book.year,
          genres: book.genres,
          cover: book.cover,
          collection_id: book.collection?.id,
          location_id: book.location.id,
        };
      } else {
        return formDefaultValues;
      }
    }, [book]),
  });
  const dispatch = useAppDispatch();
  const createBookState = useAppSelector(
    (state) => state.books.createBookSlice
  );
  const updateBookState = useAppSelector(
    (state) => state.books.updateBookSlice
  );
  const getAllCollectionsState = useAppSelector(
    (state) => state.collections.getAllCollectionsSlice
  );
  const getAllLocationsState = useAppSelector(
    (state) => state.locations.getAllLocationsSlice
  );

  //useStates
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [auxAuthor, setAuxAuthor] = useState("");
  const [auxUrl, setAuxUrl] = useState("");
  const [auxUrlErrorMsg, setAuxUrlErrorMsg] = useState("");
  const [isCaptureEnabled, setCaptureEnable] = useState<boolean>(false);
  const [url, setUrl] = useState<string | null>(null);

  //useRefs
  const webcamRef = useRef<Webcam>(null);
  const fileInpurRef = useRef<HTMLInputElement>(null);

  //useMemos
  const invalidInfos = useMemo(() => {
    if (isEditing) {
      if (updateBookState.status == "failure") {
        if (updateBookState.fieldValidations != undefined) {
          let finalString = "";
          for (const [key, value] of Object.entries(
            updateBookState.fieldValidations
          )) {
            if (finalString == "") {
              finalString += value;
            } else {
              finalString += " " + value;
            }
          }
          return finalString;
        }
      } else {
        return "";
      }
    } else {
      if (createBookState.status == "failure") {
        if (createBookState.fieldValidations != undefined) {
          let finalString = "";

          for (const [key, value] of Object.entries(
            createBookState.fieldValidations
          )) {
            if (finalString == "") {
              finalString += value;
            } else {
              finalString += " " + value;
            }
          }
          return finalString;
        }
      } else {
        return "";
      }
    }
  }, [
    createBookState.fieldValidations,
    createBookState.status,
    updateBookState.fieldValidations,
    updateBookState.status,
  ]);

  //useCallbacks
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      form.setValue("cover", imageSrc);
    }
  }, [webcamRef]);

  //Functions
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditing) {
      let newBook: CreateBookDTO = {
        id: book?.id,
        title: values.name,
        authors: values.authors,
        publisher: values.publisher,
        languages: values.languages,
        edition: values.edition,
        isbn: values.isbn,
        year: values.year,
        genres: values.genres,
        cover: values.cover === null ? undefined : values.cover,
        collection_id: values.collection_id,
        location_id: values.location_id,
        user_id: userId,
      };
      dispatch(doUpdateBook(newBook));
    } else {
      let newBook: CreateBookDTO = {
        id: undefined,
        title: values.name,
        authors: values.authors,
        publisher: values.publisher,
        languages: values.languages,
        edition: values.edition,
        isbn: values.isbn,
        year: values.year,
        genres: values.genres,
        cover: values.cover === null ? undefined : values.cover,
        collection_id: values.collection_id,
        location_id: values.location_id,
        user_id: userId,
      };
      dispatch(doCreateBook(newBook));
    }
  }

  function afterSuccess() {
    if (isEditing) {
      dispatch(resetUpdateBookState({}));
    } else {
      dispatch(resetCreateBookState({}));
    }
  }

  //useEffects
  useEffect(() => {
    setUserId(getTokenData()?.id ?? 0);
    dispatch(doGetAllCollections());
    dispatch(doGetAllLocations());
  }, []);

  useEffect(() => {
    if (
      createBookState.status == "success" ||
      createBookState.status == "failure" ||
      createBookState.status == "loading"
    ) {
      if (createBookState.status === "success") {
        form.reset(formDefaultValues, { keepValues: false });
        setUrl("");
        setAuxUrl("");
      }
      setDialogOpen(true);
    }
  }, [createBookState.status]);

  useEffect(() => {
    if (
      updateBookState.status == "success" ||
      updateBookState.status == "failure" ||
      updateBookState.status == "loading"
    ) {
      if (updateBookState.status === "success") {
      }
      setDialogOpen(true);
    }
  }, [updateBookState.status]);

  //   useEffect(() => {
  //     if (
  //       getAllCollectionsState.status === "success" &&
  //       getAllLocationsState.status === "success"
  //     ) {
  //       form.reset(book, { keepValues: false });
  //     }
  //   }, [getAllCollectionsState.status, getAllLocationsState.status]);

  return (
    <div className={" w-full h-full"}>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar" : "Cadastrar"} Livro
            </DialogTitle>
          </DialogHeader>
          <div className="">
            {(createBookState?.status == "failure" ||
              updateBookState?.status === "failure") && (
              <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
                <h3 className="text-lg font-medium">
                  Falha ao {isEditing ? "editar" : "cadastrar"} livro
                </h3>
                <CircleX size={42} className="text-red-700" />
                <p className="text-sm">
                  {isEditing
                    ? updateBookState?.errorMsg
                    : createBookState?.errorMsg}
                </p>
                {invalidInfos != "" && (
                  <p className="text-sm">{invalidInfos}</p>
                )}

                <Button
                  variant={"default"}
                  onClick={() => setDialogOpen(false)}
                  className="mt-4"
                >
                  Fechar
                </Button>
              </div>
            )}
            {(createBookState?.status == "loading" ||
              updateBookState.status === "loading") && (
              <div className="flex w-full h-full justify-center items-center">
                <Loader2 className="my-8 h-20 w-20 animate-spin" />
              </div>
            )}
            {(createBookState?.status == "success" ||
              updateBookState.status === "success") && (
              <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
                <p className="font-medium text-lg">
                  Livro {isEditing ? "editado" : "cadastrado"} com sucesso
                </p>
                <CheckCircle2 size={42} className="text-green-500" />
                <Button
                  variant={"default"}
                  onClick={() => {
                    setDialogOpen(false);
                    afterSuccess();
                  }}
                  className="mt-4"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="w-full flex justify-center align-top">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 flex flex-row flex-wrap max-w-4xl gap-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-[564px] flex-grow">
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input id="bookName" className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem className="w-[324px] flex flex-col">
                  <FormLabel>Autores</FormLabel>
                  <div>
                    {field.value == undefined || field.value.length == 0 ? (
                      <></>
                    ) : (
                      <div className="flex flex-row flex-wrap justify-start items-center gap-2 mb-3">
                        {field.value.map((author, index) => {
                          return (
                            <Badge
                              key={"author-badge" + index}
                              className="px-2 py-1"
                            >
                              <span className="font-sans font-bold text-sm mr-2">
                                {author.name}
                              </span>
                              <CircleX
                                size={16}
                                onClick={(e) => {
                                  field.value.splice(index, 1);
                                  form.setValue("authors", field.value);
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    <Input
                      className=""
                      value={auxAuthor}
                      onChange={(e) => setAuxAuthor(e.target.value)}
                      type="text"
                    />
                    <Button
                      className="mt-4"
                      onClick={(e) => {
                        e.preventDefault();
                        if (auxAuthor === "") {
                          return;
                        }
                        form.setValue(
                          "authors",
                          [
                            ...form.getValues().authors,
                            {
                              name: auxAuthor,
                              url: undefined,
                            },
                          ],
                          {
                            shouldTouch: true,
                            shouldValidate: true,
                          }
                        );
                        setAuxAuthor("");
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem className="w-[324px] flex flex-col">
                  <FormLabel>Idiomas</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[324px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="w-11/12 text-left overflow-clip">
                            {field.value?.length > 0
                              ? languages
                                  .filter(
                                    (language) =>
                                      field.value.filter(
                                        (lang) => lang.code === language.code
                                      ).length > 0
                                  )
                                  ?.map((a) => a.name + "")
                                  ?.reduce((a, b) => `${a}, ${b}`)
                              : "Selecione os Idiomas"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Pesquisar Idiomas..." />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {languages.map((language) => (
                              <CommandItem
                                value={language.name}
                                key={language.code}
                                onSelect={() => {
                                  let actualLangs = form.getValues().languages;
                                  if (
                                    actualLangs.filter(
                                      (lang) => lang.code === language.code
                                    ).length > 0
                                  ) {
                                    form.setValue(
                                      "languages",
                                      form
                                        .getValues()
                                        .languages.filter(
                                          (lang) => lang.code !== language.code
                                        )
                                    );
                                  } else {
                                    form.setValue("languages", [
                                      ...form.getValues().languages,
                                      {
                                        name: language.name,
                                        code: language.code,
                                      },
                                    ]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form
                                      .getValues()
                                      .languages.find(
                                        (item) => item.code === language.code
                                      )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {language.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publisher"
              render={({ field }) => (
                <FormItem className="w-96">
                  <FormLabel>Editora</FormLabel>
                  <FormControl>
                    <Input id="publisher" className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="edition"
              render={({ field }) => (
                <FormItem className="w-44">
                  <FormLabel>Edição</FormLabel>
                  <FormControl>
                    <Input id="edition" className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem className="w-44">
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input id="bookISBN" className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="w-44">
                  <FormLabel>Ano de Publicação</FormLabel>
                  <FormControl>
                    <Input id="bookYear" className="col-span-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genres"
              render={({ field }) => (
                <FormItem className="w-[324px] flex flex-col">
                  <FormLabel>Gêneros</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[324px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="w-11/12 text-left overflow-clip">
                            {field.value?.length > 0
                              ? genres
                                  .filter(
                                    (gen) =>
                                      field.value.filter(
                                        (genre) => gen.name === genre.name
                                      ).length > 0
                                  )
                                  ?.map((a) => a.name + "")
                                  ?.reduce((a, b) => `${a}, ${b}`)
                              : "Selecione os Gêneros"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Pesquisar Gêneros..." />
                        <CommandList>
                          <CommandEmpty>Nenhum gênero encontrado</CommandEmpty>
                          <CommandGroup>
                            {genres.map((genre) => (
                              <CommandItem
                                value={genre.name}
                                key={genre.name}
                                onSelect={() => {
                                  let actualGenres = form.getValues().genres;
                                  if (
                                    actualGenres.filter(
                                      (gen) => gen.name === genre.name
                                    ).length > 0
                                  ) {
                                    form.setValue(
                                      "genres",
                                      form
                                        .getValues()
                                        .genres.filter(
                                          (gen) => gen.name !== genre.name
                                        )
                                    );
                                  } else {
                                    form.setValue("genres", [
                                      ...form.getValues().genres,
                                      {
                                        name: genre.name,
                                      },
                                    ]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form
                                      .getValues()
                                      .genres?.find(
                                        (item) => item.name === genre.name
                                      )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {genre.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cover"
              render={({ field }) => (
                <FormItem className="w-96">
                  <FormLabel>Capa</FormLabel>
                  <div className="w-full flex flex-col justify-between gap-4">
                    <div className="w-full">
                      {(isCaptureEnabled && (
                        <Webcam
                          audio={false}
                          width={540}
                          height={360}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={videoConstraints}
                        />
                      )) ||
                        url ||
                        (field.value && (
                          <img
                            src={
                              url != undefined
                                ? decodeURIComponent(url)
                                : field.value!
                            }
                            alt="Screenshot"
                            width={540}
                            height={360}
                          />
                        )) || (
                          <img
                            src="https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781787550360/classic-book-cover-foiled-journal-9781787550360_hr.jpg"
                            alt="Screenshot"
                            width={540}
                            height={360}
                          />
                        )}
                    </div>
                    <div className="w-full flex flex-row gap-3">
                      {(!isCaptureEnabled && !url && (
                        <>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              setCaptureEnable(true);
                            }}
                          >
                            Câmera
                          </Button>
                          <Button
                            className=""
                            onClick={(e) => {
                              e.preventDefault();
                              fileInpurRef.current?.click();
                            }}
                          >
                            Galeria
                          </Button>
                          <Input
                            className="hidden"
                            id="picture"
                            type="file"
                            accept="image/jpg, image/png, image/svg, image/bmp, image/webp, image/jpeg"
                            ref={fileInpurRef}
                            onChange={(e) => {
                              e.preventDefault();
                              if (e.target.files != null) {
                                if (e.target.files[0].size > 1048576 * 5) {
                                  alert("Favor utilizar imagens de até 5MB");
                                  e.target.value = "";
                                } else {
                                  let fileUrl = URL.createObjectURL(
                                    e.target.files[0] ?? ""
                                  );
                                  setUrl(fileUrl);
                                  form.setValue("cover", fileUrl);
                                }
                              }
                            }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button>Link</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96">
                              <div className="grid gap-4">
                                <div className="grid gap-2">
                                  <div className="grid grid-cols-8 items-center gap-2">
                                    <Label htmlFor="link">URL</Label>
                                    <Input
                                      id="link"
                                      defaultValue=""
                                      className="col-span-7 h-8"
                                      onChange={(e) => {
                                        setAuxUrlErrorMsg("");
                                        setAuxUrl(e.target.value);
                                      }}
                                    />
                                    {(auxUrlErrorMsg !== "" && (
                                      <p className="text-red-600 col-span-8">
                                        {auxUrlErrorMsg}
                                      </p>
                                    )) || <></>}
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (
                                          !auxUrl.startsWith("http://") &&
                                          !auxUrl.startsWith("https://") &&
                                          !(
                                            auxUrl.endsWith(".png") ||
                                            auxUrl.endsWith(".jpg") ||
                                            auxUrl.endsWith(".jpeg") ||
                                            auxUrl.endsWith(".svg") ||
                                            auxUrl.endsWith(".webp") ||
                                            auxUrl.endsWith(".bmp")
                                          )
                                        ) {
                                          setAuxUrlErrorMsg("Link inválido");
                                        } else {
                                          setAuxUrlErrorMsg("");
                                          setUrl(auxUrl);
                                          form.setValue("cover", auxUrl);
                                        }
                                      }}
                                    >
                                      Ok
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </>
                      )) ||
                        (url && (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              setUrl(null);
                              form.setValue("cover", "");
                            }}
                            variant={"destructive"}
                          >
                            Descartar
                          </Button>
                        )) || (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              capture();
                              setCaptureEnable(false);
                            }}
                          >
                            Capturar
                          </Button>
                        )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collection_id"
              render={({ field }) => (
                <FormItem className="w-[324px] flex flex-col">
                  <FormLabel>Coleção</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[324px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="w-11/12 text-left overflow-clip">
                            {field.value !== undefined && field.value !== null
                              ? getAllCollectionsState.collections.find(
                                  (collection) =>
                                    collection.id ===
                                    form.getValues().collection_id
                                )?.name
                              : "Selecione a Coleção"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Pesquisar Coleções..." />
                        <CommandList>
                          <CommandEmpty>
                            Nenhuma coleção encontrada
                          </CommandEmpty>
                          <CommandGroup>
                            {getAllCollectionsState.collections.map(
                              (collection) => (
                                <CommandItem
                                  value={collection.name}
                                  key={collection.id}
                                  onSelect={() => {
                                    if (
                                      form.getValues().collection_id ===
                                      collection.id
                                    ) {
                                      form.setValue(
                                        "collection_id",
                                        undefined,
                                        {
                                          shouldTouch: true,
                                          shouldValidate: true,
                                        }
                                      );
                                    } else {
                                      form.setValue(
                                        "collection_id",
                                        collection.id,
                                        {
                                          shouldTouch: true,
                                          shouldValidate: true,
                                        }
                                      );
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.getValues().collection_id ===
                                        collection.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {collection.name}
                                </CommandItem>
                              )
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem className="w-[324px] flex flex-col">
                  <FormLabel>Localização</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[324px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="w-11/12 text-left overflow-clip">
                            {field.value !== undefined
                              ? getAllLocationsState.locations.find(
                                  (location) => location.id === field.value
                                )?.name
                              : "Selecione a Localização"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Pesquisar Localizações..." />
                        <CommandList>
                          <CommandEmpty>
                            Nenhuma localizção encontrada
                          </CommandEmpty>
                          <CommandGroup>
                            {getAllLocationsState.locations.map((location) => (
                              <CommandItem
                                value={location.name}
                                key={location.id}
                                onSelect={() => {
                                  form.setValue(
                                    "location_id",
                                    location.id ?? 0
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.getValues().location_id === location.id
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditing ? "Salvar" : "Cadastrar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export { BookForm };
