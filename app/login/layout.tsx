import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import StoreProvider from "../storeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Login - Online Librarian",
  description: "Login - Online Librarian",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={
        inter.className + " bg-background text-foreground min-h-screen h-full"
      }
    >
      <StoreProvider>{children}</StoreProvider>
    </div>
  );
}
