import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Livro - Online Librarian",
  description: "Editar Livro - Online Librarian",
};

export default function BookEditingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
