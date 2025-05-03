import { getUser } from "@/auth/server";
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  // SidebarHeader,
} from "@/components/ui/sidebar";
import { prisma } from "@/db/prisma";
import { Note } from "@prisma/client";
import Link from "next/link";
import SidebarGroupContent from "./SidebarGroupContent";

async function AppSidebar() {
  const user = await getUser();

  let notes: Note[] = [];

  if (user) {
    notes = await prisma.note.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }
  return (
    <Sidebar>
      {/* <SidebarHeader /> */}
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup />
        <SidebarGroupLabel className="mt-2 mb-2 text-lg">
          {user ? (
            "Your Notes"
          ) : (
            <p>
              <Link href="/login" className="text-blue-500 hover:underline">
                Log in
              </Link>
              {" to see your notes"}
            </p>
          )}
        </SidebarGroupLabel>
        {user && <SidebarGroupContent notes={notes} />}
        <SidebarGroup />
      </SidebarContent>
      {/* <SidebarFooter /> */}
    </Sidebar>
  );
}

export default AppSidebar;
