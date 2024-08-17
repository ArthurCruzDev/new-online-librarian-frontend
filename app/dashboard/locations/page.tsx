"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { doGetAllLocations, Location } from "./locationSlice";
import { Button } from "@/components/ui/button";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
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

export default function LocationsPage() {
  const dispatch = useAppDispatch();
  const getAllLocationsState = useAppSelector((state) => state.locations);
  const [search, setSearch] = useState("");

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
    if (getAllLocationsState.status === "idle") {
      dispatch(doGetAllLocations());
    }
  }, [dispatch, getAllLocationsState.status]);

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
        <Button variant="default" size={"sm"} className="ml-5">
          <Plus />
        </Button>
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
    <Card className="w-[380px] my-0 mx-auto">
      <CardHeader>{location.name}</CardHeader>
      <CardContent>
        <div className="w-full h-[200px] relative">
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
