import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Localizações - Online Librarian",
  description: "Localizações - Online Librarian",
};

export default function LocationsPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
