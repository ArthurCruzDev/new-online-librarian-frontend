import "../globals.css";
import StoreProvider from "../storeProvider";
import { Button } from "@/components/ui/button";
import { Book, Library, Map, MapPin, Menu, User } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Navigation } from "@/components/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full">
      <Sheet>
        <Navigation />
        <StoreProvider>{children}</StoreProvider>
      </Sheet>
    </div>
  );
}
