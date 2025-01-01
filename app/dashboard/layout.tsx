"use client";
import "../globals.css";
import StoreProvider from "../storeProvider";
import { Button } from "@/components/ui/button";
import { Book, Library, Map, MapPin, Menu, User } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Navigation } from "@/components/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full h-full">
      <Sheet open={open} onOpenChange={setOpen}>
        <Navigation open={open} setOpen={setOpen} />
        <StoreProvider>
          <div className="w-full h-full p-12">{children}</div>
        </StoreProvider>
      </Sheet>
    </div>
  );
}
