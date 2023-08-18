import { Chip, Collapse } from '@mui/material';
import { SavedPrompt } from '../common/saving/types';
import { useRef, useState } from 'react';

export interface SavedPromptDisplayProps {
  prompt: SavedPrompt;
}

export function SavedPromptDisplay({ prompt }: SavedPromptDisplayProps) {
  const { name, contents, tags } = prompt;

  const [open, setOpen] = useState(false);

  const promptText = useRef<HTMLParagraphElement | null>(null);

  function handlePromptDoubleClick() {
    const promptTextNode = promptText.current;
    if (!promptTextNode) {
      return;
    }
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.selectAllChildren(promptTextNode);
  }

  return (
    <div className="py-1">
      <h3 className="flex justify-between pb-2">
        <span
          className=" flex-shrink cursor-pointer select-none font-[cursive]"
          onClick={() => setOpen(!open)}>
          {name || 'UNNAMED'}
        </span>
        <span className="flex flex-grow justify-end gap-2">
          {tags.map((tag, idx) => (
            <Chip key={`${tag}-${idx}`} variant="outlined" label={tag} />
          ))}
        </span>
      </h3>
      <Collapse in={open}>
        <p
          ref={promptText}
          className="h-40 overflow-auto bg-gray-800 bg-opacity-50"
          onDoubleClick={handlePromptDoubleClick}>
          {contents}
        </p>
      </Collapse>
      <hr />
    </div>
  );
}
