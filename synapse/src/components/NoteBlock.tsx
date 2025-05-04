import React, { useState, useRef } from "react";

type Block = {
  id: string;
  text: string;
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const NoteBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: generateId(), text: "" },
  ]);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const updateBlockText = (id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, text } : block)),
    );
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number,
    id: string,
  ) => {
    const block = blocks[index];

    if (e.key === "Enter") {
      e.preventDefault();
      const newBlock: Block = { id: generateId(), text: "" };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);

      // Move focus to the new block
      setTimeout(() => {
        blockRefs.current[newBlock.id]?.focus();
      }, 0);
    }

    if (e.key === "Backspace" && block.text === "" && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = blocks.filter((b) => b.id !== id);
      setBlocks(newBlocks);

      // Focus previous block
      const prevBlock = blocks[index - 1];
      setTimeout(() => {
        blockRefs.current[prevBlock.id]?.focus();
      }, 0);
    }
  };

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          ref={(el) => {
            blockRefs.current[block.id] = el;
          }}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) =>
            updateBlockText(block.id, (e.target as HTMLDivElement).innerText)
          }
          onKeyDown={(e) => handleKeyDown(e, index, block.id)}
          className="min-h-[24px] rounded border bg-white px-2 py-1 shadow-sm focus:outline-blue-500"
          data-placeholder="Type something..."
        >
          {block.text}
        </div>
      ))}
    </div>
  );
};

export default NoteBlocks;
