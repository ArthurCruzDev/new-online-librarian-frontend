"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/store_hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  doCreateCollection,
  doDeleteCollection,
  doGetAllCollections,
  doUpdateCollection,
  Collection,
  resetCreateCollectionState,
  resetDeleteCollectionState,
} from "./collectionsSlice";
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

export default function CollectionsPage() {
  const dispatch = useAppDispatch();
  const getAllCollectionsState = useAppSelector(
    (state) => state.collections.getAllCollectionsSlice
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
      getAllCollectionsState.status === "idle" ||
      getAllCollectionsState.status === "success"
    ) {
      dispatch(doGetAllCollections());
    }
  }, []);

  const getCollections = useCallback(() => {
    return getAllCollectionsState.collections
      .filter((collection) => {
        if (search === "") {
          return true;
        }
        return collection.name.toLowerCase().includes(search.toLowerCase());
      })
      .map<React.ReactElement>((collection, index) => {
        return <CollectionComponent key={index} collection={collection} />;
      });
  }, [getAllCollectionsState.collections, search]);

  return (
    <main className="flex w-full h-full flex-col justify-center items-center">
      <div className="w-full flex justify-start items-center mb-7">
        <h1 className="font-serif font-semibold text-3xl">Coleções</h1>

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
          <AddEditCollection
            collection={undefined}
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
        {(getAllCollectionsState == null ||
          getAllCollectionsState.status == null ||
          getAllCollectionsState.status === "idle") && (
          <p className="">
            Você não possui nenhuma coleção cadastrada no momento.
            <br />
            Clique no botão <strong>+</strong> para criar uma nova coleção.
          </p>
        )}
        {getAllCollectionsState != null &&
          getAllCollectionsState.status != null &&
          getAllCollectionsState.status === "success" &&
          getCollections()}
        {getAllCollectionsState != null &&
          getAllCollectionsState.status != null &&
          getAllCollectionsState.status === "loading" && (
            <div className="flex w-full h-full justify-center items-center">
              <Loader2 className="mt-16 h-20 w-20 animate-spin" />
            </div>
          )}
      </div>
    </main>
  );
}

type CollectionComponentProps = {
  collection: Collection;
};

function CollectionComponent({
  collection,
}: CollectionComponentProps): React.ReactElement {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <Card className="w-[280px] my-0 mx-auto shadow-md">
      <CardHeader>{collection.name}</CardHeader>
      <CardContent>
        <div className="w-full h-[138px] relative">
          <Image
            src={
              "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            }
            layout="fill"
            objectFit="cover"
            alt="collection image"
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
        <AddEditCollection
          collection={collection}
          closeCallback={() => setEditDialogOpen(false)}
        />
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DeleteCollection
          collection={collection}
          closeCallback={() => setDeleteDialogOpen(false)}
        />
      </Dialog>
    </Card>
  );
}

type AddEditCollectionProps = {
  collection?: Collection;
  closeCallback: Function;
};

function AddEditCollection({
  collection,
  closeCallback,
}: AddEditCollectionProps): React.ReactElement {
  const [userId, setUserId] = useState(0);

  const dispatch = useAppDispatch();
  const createCollectionState = useAppSelector(
    (state) => state.collections.createCollectionSlice
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
    if (collection != null && collection != undefined) {
      form.setValue("name", collection.name);
    }
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    let newCollection: Collection = {
      id: collection?.id,
      name: values.name,
      user_id: collection?.user_id ?? userId,
    };
    if (collection?.id != undefined) {
      dispatch(doUpdateCollection(newCollection));
    } else {
      dispatch(doCreateCollection(newCollection));
    }
  }

  function closeAfterSuccess() {
    dispatch(doGetAllCollections());
    dispatch(resetCreateCollectionState({}));
    closeCallback(true);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {collection?.id == null ? "Criar" : "Editar"} Coleção
        </DialogTitle>
      </DialogHeader>
      {createCollectionState?.status == "idle" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      id="collectionName"
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {collection?.id == null ? "Criar" : "Editar"}
            </Button>
          </form>
        </Form>
      )}
      {createCollectionState?.status == "failure" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      id="collectionName"
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                  {createCollectionState?.error && (
                    <FormDescription className="text-red-700 font-semibold">
                      {createCollectionState?.errorMsg}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {collection?.id == null ? "Criar" : "Editar"}
            </Button>
          </form>
        </Form>
      )}
      {createCollectionState?.status == "loading" && (
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="my-8 h-20 w-20 animate-spin" />
        </div>
      )}
      {createCollectionState?.status == "success" && (
        <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
          <p className="font-medium text-lg">Coleção criada com sucesso</p>
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

type DeleteCollectionProps = {
  collection: Collection;
  closeCallback: Function;
};

function DeleteCollection({
  collection,
  closeCallback,
}: DeleteCollectionProps): React.ReactElement {
  const [userId, setUserId] = useState(0);

  const dispatch = useAppDispatch();
  const deleteCollectionState = useAppSelector(
    (state) => state.collections.deleteCollectionSlice
  );

  useEffect(() => {
    setUserId(getTokenData()?.id ?? 0);
  }, []);

  function onSubmit() {
    dispatch(doDeleteCollection(collection));
  }

  function closeAfterSuccess() {
    dispatch(doGetAllCollections());
    dispatch(resetDeleteCollectionState({}));
    closeCallback(true);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Remover Coleção</DialogTitle>
      </DialogHeader>
      {(deleteCollectionState?.status == "idle" ||
        deleteCollectionState?.status == "failure") && (
        <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
          <p className="font-medium text-lg text-center">
            Confirma que deseja remover a coleção?
          </p>
          {deleteCollectionState?.status === "failure" && (
            <p className="font-normal text-md text-center text-red-700">
              {deleteCollectionState?.errorMsg}
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
      {deleteCollectionState?.status == "loading" && (
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="my-8 h-20 w-20 animate-spin" />
        </div>
      )}
      {deleteCollectionState?.status == "success" && (
        <div className="flex flex-col w-full h-full justify-center items-center gap-6 mt-4">
          <p className="font-medium text-lg">Coleção removida com sucesso</p>
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
