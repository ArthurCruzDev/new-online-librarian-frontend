import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Livros - Online Librarian",
  description: "Livros - Online Librarian",
};

export default function BooksPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense>{children}</Suspense>;
}
