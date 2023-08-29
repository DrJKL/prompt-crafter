import { animated } from '@react-spring/web';
import { Prompt } from '@rendering/parsed_types';
import { KeyPath } from '@rendering/rendering_utils';
import { ForwardedRef, forwardRef } from 'react';
import { ChunkView } from './ChunkView';

interface PromptProps extends KeyPath {
  prompt: Prompt;
}

export const PromptView = forwardRef<HTMLSpanElement, PromptProps>(
  function PromptView(
    { prompt, path, updateSelection, fancy, dense }: PromptProps,
    ref: ForwardedRef<HTMLSpanElement>,
  ) {
    return (
      <animated.span className="inline-block" ref={ref}>
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
      </animated.span>
    );
  },
);
