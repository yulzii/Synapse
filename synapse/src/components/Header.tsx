import Link from "next/link";
import Image from "next/image";
import { shadow } from "@/styles/utils";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import LogOutButton from "@/components/LogOutButton";
import { getUser } from "@/auth/server";

async function Header() {
  const user = await getUser();

  return (
    <header
      className="bg-popover relative flex h-12 w-full items-center justify-between sm:px-8"
      style={{
        boxShadow: shadow,
      }}
    >
      <Link href="/" className="flex items-end">
        <Image
          src="/synapseLogo.png"
          height={30}
          width={30}
          alt="Synapse Notes Logo"
          className="rounded-full"
          priority
        />

        <h1 className="text-md flex flex-col pb-1">Synapse Notes</h1>
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
