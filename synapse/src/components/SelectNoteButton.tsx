"use client";
import useNote from "@/hooks/useNote";
import { Note } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarMenuButton } from "./ui/sidebar";
import Link from "next/link";

type Props = {
  note: Note;
};

function SelectNoteButton({ note }: Props) {
  const noteId = useSearchParams().get("noteId") || "";

  const [shouldUseGlobalNoteText, setShouldUseGlobalNoteText] = useState(false);
  const { noteText: selectedNoteText } = useNote();
  const [localNoteText, setLocalNoteText] = useState(note.content);
  const [localNoteTitle, setLocalNoteTitle] = useState(note.title);

  useEffect(() => {
    if (noteId === note.id) {
      setShouldUseGlobalNoteText(true);
    } else {
      setShouldUseGlobalNoteText(false);
    }
  }, [noteId, note.id]);

  useEffect(() => {
    if (shouldUseGlobalNoteText) {
      setLocalNoteText(selectedNoteText);
    }
  }, [shouldUseGlobalNoteText, selectedNoteText]);

  const blankNoteText = "EMPTY NOTE";
  let noteText = localNoteText || blankNoteText;
  if (shouldUseGlobalNoteText) {
    noteText = selectedNoteText || blankNoteText;
  }

  return (
    <SidebarMenuButton
      asChild
      className={`items-start gap-0 pr-12 ${note.id === noteId && "bg-sidebar-accent/50"}`}
    >
      <Link href={`/?noteId=${note.id}`} className="flex h-fit flex-col">
        <p className="text-md w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {localNoteTitle}
        </p>
        <p className="text-muted-foreground flex w-full flex-col truncate overflow-hidden text-xs text-ellipsis">
          ({note.updatedAt.toLocaleDateString()}) {noteText}
        </p>
      </Link>
    </SidebarMenuButton>
  );
}

export default SelectNoteButton;
