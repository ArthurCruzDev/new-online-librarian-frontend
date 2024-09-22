import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livros - Online Librarian",
  description: "Livros - Online Librarian",
};

export default function BooksPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
