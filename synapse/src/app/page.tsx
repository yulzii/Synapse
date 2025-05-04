import { getUser } from "@/auth/server";
import AskAIButton from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { prisma } from "@/db/prisma";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function HomePage({ searchParams }: Props) {
  const noteIdParam = (await searchParams).noteId;
  const user = await getUser();
  const api_key_configured = process.env.GOOGLE_API_KEY ? true : false;

  // const noteIdParam = (await searchParams).noteId;
  const noteId = Array.isArray(noteIdParam)
    ? noteIdParam[0] // Use the first value if it's an array
    : noteIdParam || ""; // Use the value or fallback to an empty string

  // const noteId = Array.isArray(noteIdParam)
  //   ? noteIdParam![0]
  //   : noteIdParam || "";

  const note = await prisma.note.findUnique({
    where: { id: noteId, authorId: user?.id },
  });

  return (
    <div className="mt-0 flex h-full flex-col gap-4">
      <div className="flex w-full justify-between">
        <div>
          <SidebarTrigger />
        </div>
        <div className="flex gap-2">
          <AskAIButton user={user} api_key_configured={api_key_configured} />
          <NewNoteButton user={user} />
        </div>
      </div>

      <NoteTextInput noteId={noteId} startingNoteText={note?.content || ""} />
    </div>
  );
}

export default HomePage;
