import { Chip, Collapse, Tooltip, IconButton } from '@mui/material';
import { SavedPrompt } from '../common/saving/types';
import { useRef, useState } from 'react';
import { DeleteForever, NorthWest } from '@mui/icons-material';
import { useConfirm } from 'material-ui-confirm';
import { deletePromptLocal } from '../common/saving/localstorage';

export interface SavedPromptDisplayProps {
  prompt: SavedPrompt;
  setPromptText: (prompt: string) => void;
}

export function SavedPromptDisplay({
  prompt,
  setPromptText,
}: SavedPromptDisplayProps) {
  const { name, contents, tags } = prompt;

  const [open, setOpen] = useState(false);
  const confirm = useConfirm();

  const promptText = useRef<HTMLPreElement | null>(null);

  function handlePromptDoubleClick() {
    const promptTextNode = promptText.current;
    if (!promptTextNode) {
      return;
    }
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.selectAllChildren(promptTextNode);
  }

  async function handleDelete() {
    try {
      await confirm({
        description: `Are you sure you want to delete ${name}?`,
      });

      deletePromptLocal(prompt);
    } catch (err: unknown) {
      console.error(`Canceled deletion of ${name}\n${err}`);
    }
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
        <pre
          ref={promptText}
          className="h-40 overflow-auto bg-gray-800 bg-opacity-50"
          onDoubleClick={handlePromptDoubleClick}>
          {contents}
        </pre>
        <div>
          <Tooltip title="Replace current prompt with saved prompt">
            <IconButton
              aria-label=""
              onClick={() => {
                setPromptText(contents);
              }}>
              <NorthWest />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete this Saved Prompt">
            <IconButton aria-label="" onClick={handleDelete}>
              <DeleteForever />
            </IconButton>
          </Tooltip>
        </div>
      </Collapse>
      <hr />
    </div>
  );
}
