"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Book,
  Home,
  Library,
  Map,
  MapPin,
  Menu,
  Power,
  User,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import "../app/globals.css";
import { useCallback, useState } from "react";
import { deleteToken } from "@/lib/api_client";
import { Separator } from "./ui/separator";

type NavigationProps = {
  open: boolean;
  setOpen: Function;
};

export function Navigation({ open, setOpen }: NavigationProps) {
  const router = useRouter();
  const changePage = useCallback(
    (path: string) => {
      router.push(path);
      setOpen(!open);
    },
    [open, router, setOpen]
  );

  return (
    <nav className="relative z-50 flex w-full h-16 p-2 bg-background shadow-sm justify-center items-center">
      <div>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
      </div>
      <div className="flex-grow"></div>
      <div className="mx-2">
        <ModeToggle />
      </div>
      <div className="flex flex-row justify-start items-center ml-2 min-w-36">
        <Avatar id="avatar">
          <AvatarFallback className="bg-primary-foreground">AC</AvatarFallback>
        </Avatar>
        <Label className="ml-2 text-base font-sans font-light" htmlFor="avatar">
          Arthur Cruz
        </Label>
      </div>
      <SheetContent side={"left"} className="pl-0 pr-0 w-72">
        <div className="flex flex-col justify-start align-top p-1 mt-8 h-full">
          <Separator orientation="horizontal" className="mb-4" />
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
              onClick={() => changePage("/dashboard/home")}
            >
              <Home className="mr-3 text-primary" />
              Início
            </Button>
          </div>
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
              onClick={() => changePage("/dashboard/books")}
            >
              <Book className="mr-3 text-primary" />
              Livros
            </Button>
          </div>
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
              onClick={() => changePage("/dashboard/locations")}
            >
              <MapPin className="mr-3 text-primary" />
              Localizações
            </Button>
          </div>
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
              onClick={() => changePage("/dashboard/collections")}
            >
              <Library className="mr-3 text-primary" />
              Coleções
            </Button>
          </div>
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
              onClick={() => {
                deleteToken();
                changePage("/");
              }}
            >
              <Power className="mr-3 text-primary" />
              Sair
            </Button>
          </div>
          <div className="flex-1"></div>
          <Separator orientation="horizontal" className="my-14" />
        </div>
      </SheetContent>
    </nav>
  );
}
