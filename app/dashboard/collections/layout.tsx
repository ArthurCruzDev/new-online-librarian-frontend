import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coleções - Online Librarian",
  description: "Coleções - Online Librarian",
};

export default function LocationsPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
