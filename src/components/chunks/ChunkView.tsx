import { Chunk } from '@rendering/parsed_types';
import { KeyPath } from '@rendering/rendering_utils';
import { ReactNode } from 'react';
import { GroupView } from './GroupView';
import { LiteralView } from './LiteralView';
import { FancyVariantView, VariantView } from './VariantsViews';
import { WildcardView } from './WildcardView';

export interface ChunkProps extends KeyPath {
  chunk: Chunk;
}

export function ChunkView({
  chunk,
  path,
  updateSelection,
  fancy,
  dense,
}: ChunkProps): ReactNode {
  if (!chunk) {
    return <>Ummmm...</>;
  }
  switch (chunk.type) {
    case 'literal':
      return (
        <LiteralView
          updateSelection={updateSelection}
          literal={chunk}
          fancy={fancy}
          dense={dense}
          path={path}
        />
      );
    case 'variants':
      return fancy ? (
        <FancyVariantView
          variants={chunk}
          path={path}
          fancy={fancy}
          dense={dense}
          updateSelection={updateSelection}
        />
      ) : (
        <VariantView
          updateSelection={updateSelection}
          variants={chunk}
          path={path}
          fancy={fancy}
          dense={dense}
        />
      );
    case 'wildcard':
      return (
        <WildcardView
          wildcard={chunk}
          path={path}
          fancy={fancy}
          dense={dense}
          updateSelection={updateSelection}
        />
      );
    case 'group':
      return (
        <GroupView
          updateSelection={updateSelection}
          path={path}
          fancy={fancy}
          dense={dense}
          group={chunk}
        />
      );
  }
  chunk satisfies never;
  return (
    <div className="whitespace-pre-wrap bg-red-600 bg-opacity-50 text-white">
      {JSON.stringify(chunk)}
    </div>
  );
}
