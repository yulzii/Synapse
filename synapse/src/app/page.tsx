import { getUser } from "@/auth/server";
import AskAIButton from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
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
    <div className="flex h-full flex-col items-center gap-4">
      <div className="msc-w-4xl flex w-full justify-end gap-2">
        <AskAIButton user={user} api_key_configured={api_key_configured} />
        <NewNoteButton user={user} />
      </div>

      <NoteTextInput noteId={noteId} startingNoteText={note?.content || ""} />
    </div>
  );
}

export default HomePage;
