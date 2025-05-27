import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/app/(auth)/auth";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <History user={session?.user} />
          <div className="flex flex-row gap-2 items-center">
            <Image src="/images/Logo.png" height={30} width={30} alt="FTW" />
            <div className="text-zinc-500">|</div>
            <Link href="/">
              <div className="text-sm dark:text-zinc-300 truncate w-28 md:w-fit">
                Fund The World
              </div>
            </Link>
          </div>
        </div>

        <div className="flex gap-4 px-4">
          <Link href={"/all"}>
            <button className="px-4 py-2 rounded-full text-black dark:text-white  blur-sm hover:blur-0  border border-primary transition hover:ease-in-out hover:border hover:border-primary">
              All Organizations
            </button>
          </Link>
        </div>
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="px-4 py-2 rounded-full text-black dark:text-white blur-sm hover:blur-0 border border-primary transition hover:ease-in-out bg-transparent"
                variant="secondary"
              >
                {session.user?.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuItem className="p-1 z-50">
                <form
                  className="w-full"
                  action={async () => {
                    "use server";

                    await signOut({
                      redirectTo: "/",
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left px-1 py-0.5 text-red-500"
                  >
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="py-1.5 px-2 h-fit font-normal text-white" asChild>
            <Link href="/login">Be the change + login</Link>
          </Button>
        )}
      </div>
    </>
  );
};
