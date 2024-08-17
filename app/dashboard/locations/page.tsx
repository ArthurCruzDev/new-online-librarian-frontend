"use client";
import { useAppSelector } from "@/lib/hooks";

export default function LocationsPage() {
  const getAllLocationsState = useAppSelector((state) => state.locations);

  return (
    <main className="flex w-full h-full flex-row justify-center items-center">
      <div className="w-full flex justify-start items-center">
        <h1 className="font-serif font-semibold text-3xl">Localizações</h1>
      </div>
      <div className="w-full h-full flex flex-row justify-between items-start flex-wrap"></div>
    </main>
  );
}
