import { Fragment } from 'react';
import { Prompt } from './parsed_types';
import { ChunkView } from './ChunkView';
import { KeyPath } from './rendering_utils';

interface PromptProps extends KeyPath {
  prompt: Prompt;
  separator: string;
}

export function PromptView({
  prompt,
  path,
  updateSelection,
  separator,
  fancy,
}: PromptProps) {
  return (
    prompt &&
    prompt.map((c, idx) => {
      const newPath = [...path, idx];
      return (
        <Fragment key={idx}>
          {idx > 0 && <span>{separator}</span>}
          <ChunkView
            chunk={c}
            path={newPath}
            updateSelection={updateSelection}
            fancy={fancy}
          />
        </Fragment>
      );
    })
  );
}
