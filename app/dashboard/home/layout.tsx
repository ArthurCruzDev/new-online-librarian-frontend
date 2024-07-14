import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Home - Online Librarian",
  description: "Home - Online Librarian",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-full h-full">{children}</div>;
}
