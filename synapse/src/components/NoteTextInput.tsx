"use client";

import { useSearchParams } from "next/navigation";
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
    <textarea
      value={noteText}
      onChange={handleUpdateNote}
      placeholder="Type your note here"
      className="custom-scrollbar background-color:blue mb-2 h-full resize-none border-none focus:border-none focus:outline-none"
    />
  );
}

export default NoteTextInput;
