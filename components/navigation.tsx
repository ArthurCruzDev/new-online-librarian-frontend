"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Book, Library, Map, MapPin, Menu, User } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import "../app/globals.css";

export function Navigation() {
  const router = useRouter();
  return (
    <nav className="relative flex w-full h-16 p-2 bg-background shadow-sm justify-center items-center">
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
        <div className="flex flex-col justify-center align-top p-1 mt-2">
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
            >
              <Book className="mr-3 text-primary" />
              Livros
            </Button>
          </div>
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
            >
              <MapPin className="mr-3 text-primary" />
              Localizações
            </Button>
          </div>
          <div className="w-full">
            <Button
              variant={"ghost"}
              className="w-full flex flex-row justify-start text-base"
              onClick={() => router.push("/dashboard/home")}
            >
              <Library className="mr-3 text-primary" />
              Coleções
            </Button>
          </div>
        </div>
      </SheetContent>
    </nav>
  );
}
