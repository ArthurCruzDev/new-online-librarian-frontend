"use client";

import { ModeToggle } from "@/components/mode-toggler";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect } from "react";
import { doLogin } from "./loginSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import StoreProvider from "../storeProvider";

export default function Login() {
  const dispatch = useAppDispatch();
  const loginStatus = useAppSelector((state) => state.login.status);
  useEffect(() => {
    if (loginStatus === "idle") {
      dispatch(
        doLogin({ email: "arthur.cruz@gmail.com", password: "123456@A" })
      );
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button>Click me</Button>
      <ModeToggle></ModeToggle>
    </main>
  );
}
