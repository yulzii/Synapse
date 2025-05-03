"use client";

import { NoteProviderContext } from "@/providers/NoteProvider";
import { useContext } from "react";

// This hook provides access to the note text and the function to set it.
// It uses the NoteProviderContext to get the current note text and the function to update it.
// The useNote hook is a custom React hook that provides access to the note text and the function to set it.
function useNote() {
  const context = useContext(NoteProviderContext);

  if (!context) throw new Error("useNote must be used within a NoteProvider");

  return context;
}
export default useNote;
