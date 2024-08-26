"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { doCreateLocation, doGetAllLocations, Location } from "./locationSlice";
import { Button } from "@/components/ui/button";
import { Edit2, Loader2, Plus, Search, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

export default function LocationsPage() {
  const dispatch = useAppDispatch();
  const getAllLocationsState = useAppSelector(
    (state) => state.locations.getAllLocationsSlice
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
      getAllLocationsState.status === "idle" ||
      getAllLocationsState.status === "success"
    ) {
      dispatch(doGetAllLocations());
    }
  }, []);

  const getLocations = useCallback(() => {
    return getAllLocationsState.locations
      .filter((location) => {
        if (search === "") {
          return true;
        }
        return location.name.toLowerCase().includes(search.toLowerCase());
      })
      .map<React.ReactElement>((location, index) => {
        return <LocationComponent key={index} location={location} />;
      });
  }, [getAllLocationsState.locations, search]);

  return (
    <main className="flex w-full h-full flex-col justify-center items-center">
      <div className="w-full flex justify-start items-center mb-7">
        <h1 className="font-serif font-semibold text-3xl">Localizações</h1>

        <Dialog open={dialogOpen}>
          <DialogTrigger>
            <Button
              variant="default"
              size={"sm"}
              className="ml-5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus />
            </Button>
          </DialogTrigger>
          <AddEditLocation
            location={undefined}
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
        {(getAllLocationsState == null ||
          getAllLocationsState.status == null ||
          getAllLocationsState.status === "idle") && (
          <p className="">
            Você não possui nenhuma localização cadastrada no momento.
            <br />
            Clique no botão <strong>+</strong> para criar uma nova localização.
          </p>
        )}
        {getAllLocationsState != null &&
          getAllLocationsState.status != null &&
          getAllLocationsState.status === "success" &&
          getLocations()}
        {getAllLocationsState != null &&
          getAllLocationsState.status != null &&
          getAllLocationsState.status === "loading" && (
            <div className="flex w-full h-full justify-center items-center">
              <Loader2 className="mt-16 h-20 w-20 animate-spin" />
            </div>
          )}
      </div>
    </main>
  );
}

type LocationComponentProps = {
  location: Location;
};

function LocationComponent({
  location,
}: LocationComponentProps): React.ReactElement {
  return (
    <Card className="w-[280px] my-0 mx-auto shadow-md">
      <CardHeader>{location.name}</CardHeader>
      <CardContent>
        <div className="w-full h-[138px] relative">
          <Image
            src={
              "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            }
            layout="fill"
            objectFit="cover"
            alt="location image"
            quality={75}
            priority={false}
          />
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-row justify-start align-middle gap-4">
        <Button variant={"default"}>
          <Edit2 />
        </Button>
        <Button variant={"destructive"}>
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  );
}

type AddEditLocationProps = {
  location?: Location;
  closeCallback: Function;
};

export function AddEditLocation({
  location,
  closeCallback,
}: AddEditLocationProps): React.ReactElement {
  const [locationName, setLocationName] = useState("");
  const [userId, setUserId] = useState(0);

  const dispatch = useAppDispatch();
  const createLocationState = useAppSelector(
    (state) => state.locations.createLocationsSlice
  );

  useEffect(() => {
    setUserId(getTokenData()?.id ?? 0);
  }, []);

  const handleSubmitLocation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const formSchema = z.object({
    name: z.string().min(1).max(255),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    let newLocation: Location = {
      id: location?.id,
      name: values.name,
      user_id: location?.user_id ?? userId,
    };
    if (location?.id != undefined) {
      //TODO
    } else {
      dispatch(doCreateLocation(newLocation));
      closeCallback(true);
    }
  }

  useEffect(() => {
    if (createLocationState.status === "success") {
      dispatch(doGetAllLocations());
    }
  }, [dispatch, createLocationState.status]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {location?.id == null ? "Criar" : "Editar"} Localização
        </DialogTitle>
      </DialogHeader>
      {(createLocationState?.status == "idle" ||
        createLocationState.status == "success") && (
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
                      id="locationName"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {location?.id == null ? "Criar" : "Editar"}
            </Button>
          </form>
        </Form>
      )}
      <DialogFooter></DialogFooter>
    </DialogContent>
  );
}
