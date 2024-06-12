import { ModeToggle } from "@/components/mode-toggler";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Login() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button>Click me</Button>
      <ModeToggle></ModeToggle>
    </main>
  );
}
