"use client";

import { useSearchParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { ChangeEvent, useEffect } from "react";
import { debounceTimeout } from "@/lib/constants";
import useNote from "@/hooks/useNote";
import { updateNoteAction } from "@/actions/notes";

type Props = {
  noteId: string;
  startingNoteText: string;
};

let updateTimeout: NodeJS.Timeout;

function NoteTextInput({ noteId, startingNoteText }: Props) {
  const nodeIdParam = useSearchParams().get("noteId") || "";
  const { noteText, setNoteText } = useNote();

  useEffect(() => {
    if (nodeIdParam === noteId) {
      setNoteText(startingNoteText);
    }
  }, [startingNoteText, nodeIdParam, noteId, setNoteText]);

  const handleUpdateNote = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteText(text);

    //each time someone types, we clear the timeout and set a new one
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      updateNoteAction(noteId, text);
    }, debounceTimeout);
  };
  return (
    <Textarea
      value={noteText}
      onChange={handleUpdateNote}
      placeholder="Type your note here"
      className="custom-scrollbar placeholder:text-muted-foreground mb-4 h-full max-w-4xl resize-none border p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  );
}

export default NoteTextInput;
