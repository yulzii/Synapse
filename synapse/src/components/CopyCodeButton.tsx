"use client"; // This component interacts with browser APIs and state

import React, { useState, useTransition, ReactElement } from "react";
import { Copy, Check } from "lucide-react"; // Import Check icon for feedback
import { Button } from "./ui/button"; // Import ButtonProps if needed
import { toast } from "sonner";

type Props = {
  codeToCopy: string;
};

function CopyCodeButton({ codeToCopy }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopyButton = () => {
    startTransition(async () => {
      try {
        if (!navigator.clipboard) {
          throw new Error(
            "Clipboard API not available in this browser/context.",
          );
        }
        await navigator.clipboard.writeText(codeToCopy);

        // Success Feedback
        toast.success("Copied to clipboard");
        setIsCopied(true);
        // Reset the "copied" state after a short delay
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy code:", error);
        // Error Feedback
        const errorMessage =
          error instanceof Error ? error.message : "Could not copy text.";
        toast.error("Error copying", {
          description: errorMessage,
        });
        setIsCopied(false); // Ensure copied state is false on error
      }
    });
  };

  return (
    // Button receives variant, size, calculated className, and other props
    <Button
      className="absolute top-2 right-2 p-1 opacity-70 transition-opacity duration-200 hover:opacity-100 [&_svg]:size-3"
      variant="ghost" // Use the size prop for consistency
      onClick={handleCopyButton}
      disabled={isPending} // Disable button while transition is pending
      aria-label={isCopied ? "Copied code" : "Copy code"} // Dynamic aria-label
    >
      {isCopied ? <Check /> : <Copy />}
    </Button>
  );
}

export default CopyCodeButton;
