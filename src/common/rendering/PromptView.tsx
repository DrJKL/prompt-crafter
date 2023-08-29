import { Prompt } from './parsed_types';
import { ChunkView } from './ChunkView';
import { KeyPath } from './rendering_utils';
import { ForwardedRef, forwardRef } from 'react';
import { animated } from '@react-spring/web';

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
