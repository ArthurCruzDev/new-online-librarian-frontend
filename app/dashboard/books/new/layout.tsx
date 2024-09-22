import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastrar Livro - Online Librarian",
  description: "Cadastrar Livro - Online Librarian",
};

export default function BooksPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
