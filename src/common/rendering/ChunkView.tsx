import { Chunk } from './parsed_types';
import { ReactNode } from 'react';
import { FancyVariantView, VariantView } from './VariantsViews';
import { GroupView } from './GroupView';
import { LiteralView } from './LiteralView';
import { KeyPath } from './rendering_utils';

export interface ChunkProps extends KeyPath {
  chunk: Chunk;
}

export function ChunkView({
  chunk,
  path,
  updateSelection,
  fancy,
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
          path={path}
        />
      );
    case 'variants':
      return fancy ? (
        <FancyVariantView
          variants={chunk}
          path={path}
          fancy={fancy}
          updateSelection={updateSelection}
        />
      ) : (
        <VariantView
          updateSelection={updateSelection}
          variants={chunk}
          path={path}
          fancy={fancy}
        />
      );
    case 'wildcard':
      return <span className="text-amber-600">{chunk.path}</span>;
    case 'group':
      return (
        <GroupView
          updateSelection={updateSelection}
          path={path}
          fancy={fancy}
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
