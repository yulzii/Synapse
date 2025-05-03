import Link from "next/link";
import Image from "next/image";
import { shadow } from "@/styles/utils";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import LogOutButton from "@/components/LogOutButton";
import { getUser } from "@/auth/server";
import { SidebarTrigger } from "./ui/sidebar";

async function Header() {
  const user = await getUser();

  return (
    <header
      className="bg-popover relative flex h-24 w-full items-center justify-between px-3 sm:px-8"
      style={{
        boxShadow: shadow,
      }}
    >
      <SidebarTrigger className="absolute top-1 left-1" />
      <Link href="/" className="flex items-end gap-2">
        <Image
          src="/synapseLogo.png"
          height={60}
          width={60}
          alt="logo"
          className="rounded-full"
          priority
        />

        <h1 className="flex flex-col pb-1 text-2xl leading-6 font-semibold">
          Synapse Notes
        </h1>
      </Link>

      <div className="flex gap-4">
        {user ? (
          <LogOutButton />
        ) : (
          <>
            <Button asChild className="hidden sm:block">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" className="hidden sm:block">
              <Link href="/login">Login</Link>
            </Button>
          </>
        )}
        <DarkModeToggle />
      </div>
    </header>
  );
}

export default Header;
