import { Prompt } from '@rendering/parsed_types';
import { KeyPath } from '@rendering/rendering_utils';
import { ChunkView } from './ChunkView';

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
  return (
    <>
      {prompt?.map((c, idx) => {
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
      })}{' '}
    </>
  );
}
