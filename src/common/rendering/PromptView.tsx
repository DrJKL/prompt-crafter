import { Prompt } from './parsed_types';
import { ChunkView } from './ChunkView';
import { KeyPath } from './rendering_utils';

interface PromptProps extends KeyPath {
  prompt: Prompt;
}

export function PromptView({
  prompt,
  path,
  updateSelection,
  fancy,
  dense,
}: PromptProps) {
  return prompt?.map((c, idx) => {
    const newPath = [...path, idx];
    return (
      <ChunkView
        key={idx}
        chunk={c}
        path={newPath}
        updateSelection={updateSelection}
        fancy={fancy}
        dense={dense}
      />
    );
  });
}
