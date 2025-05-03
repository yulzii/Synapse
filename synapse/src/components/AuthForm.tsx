"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useTransition } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { loginAction, signUpAction } from "../actions/users";

type Props = {
  // allows for autocompletion of type
  type: "login" | "signUp";
};

function AuthForm({ type }: Props) {
  const isLoginForm = type === "login";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      let errorMessage;
      let title;
      let description;

      if (isLoginForm) {
        errorMessage = (await loginAction(email, password)).errorMessage;
        if (!errorMessage) {
          title = "Logged in";
          description = "You have been logged in successfully.";
        } else {
          title = "Login failed";
          description = "Error logging in.";
        }
      } else {
        errorMessage = (await signUpAction(email, password)).errorMessage;
        if (!errorMessage) {
          title = "Signed Up";
          description = "You have been signed up successfully.";
        } else {
          title = "Sign-up failed";
          description = "Error signing up.";
        }
      }

      if (!errorMessage) {
        toast.success(title, {
          description,
        });
        router.replace("/");
      } else {
        toast.error(title, {
          description: errorMessage,
        });
        router.replace("/");
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            required
            disabled={isPending}
          ></Input>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
            disabled={isPending}
          ></Input>
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button className="w-full">
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isLoginForm ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </Button>
        <p className="text-xs">
          {isLoginForm
            ? "Don't have an account yet? "
            : "Already have an account? "}
          <Link
            href={isLoginForm ? "/sign-up" : "/login"}
            className="$(isPending ? 'pointer-events-none opacity-50' : '') text-blue-500 hover:underline"
          >
            {isLoginForm ? "sign up" : "login"}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default AuthForm;
