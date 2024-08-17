"use client";

import { ModeToggle } from "@/components/mode-toggler";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { doLogin } from "./loginSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { isUserLoggedIn } from "@/lib/api_client";

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loginStatus = useAppSelector((state) => state.login.status);
  const loginError = useAppSelector((state) => state.login.error);
  const loginErrorMsg = useAppSelector((state) => state.login.errorMsg);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Email: " + email + " | Senha: " + password);

    if (
      email != undefined &&
      email != "" &&
      password != undefined &&
      password != ""
    ) {
      dispatch(doLogin({ email: email, password: password }));
    }
  };

  useEffect(() => {
    if (isUserLoggedIn()) {
      router.push("/dashboard/home");
    }
  }, []);

  useEffect(() => {
    if (loginStatus === "success") {
      router.push("/dashboard/home");
    }
  }, [loginStatus]);

  return (
    <main className="flex w-full h-full flex-row items-center justify-start absolute p-24">
      <div className="flex w-1/2 h-full flex-col items-start justify-start">
        <h1 className="self-start text-bold text-6xl font-serif">
          New Online Librarian
        </h1>
        <h3 className="mt-4 text-normal text-lg font-sans text-zinc-400">
          Seu gerenciador de biblioteca online.
          <br />
          Cadastre e controle seus livros da mesma maneira que uma biblioteca
          faz.
        </h3>
      </div>
      <Separator orientation="vertical" className="" />
      <div className="flex w-1/2 h-full flex-col items-start justify-start">
        <div className="self-end">
          <ModeToggle></ModeToggle>
        </div>
        <h1 className="font-bold text-4xl text-center w-full mb-1 mt-40 font-serif">
          Acessar Conta
        </h1>
        <p className="font-normal text-lg text-center w-full mb-6 text-zinc-400 font-serif">
          Entre com seu email e senha
        </p>
        <form
          className="w-full flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="max-w-96 mb-3 text-sm"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="max-w-96 mb-7 text-sm"
          />
          <Button
            className="w-96 text-base font-semibold uppercase"
            type="submit"
            disabled={loginStatus === "loading"}
          >
            {loginStatus === "loading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            ENTRAR
          </Button>
          <Button
            variant="link"
            type="button"
            className="w-96 text-base font-medium mt-4"
            onClick={(_) => {
              router.push("/forgot-password");
            }}
          >
            Esqueci minha senha
          </Button>
          <Separator className="my-8 w-80" />
          {loginError && loginErrorMsg && (
            <Card className="w-96 bg-red-700">
              <CardHeader>
                <CardTitle>Falha ao realizar login</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{loginErrorMsg}</p>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </main>
  );
}
