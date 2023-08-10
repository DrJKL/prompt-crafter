import { ReactNode } from 'react';
import { Chunk, Literal, Variants } from './parsed_types';

export function LiteralView({ literal }: { literal: Literal }) {
  return <span>{literal.value}</span>;
}

export function VariantView({ variants }: { variants: Variants }) {
  return (
    <span>
      {'{'}
      {variants.variants.map((v, idx) => (
        <span className="variant-option" key={`variant-${idx}`}>
          {idx > 0 ? '|' : ''}
          {v ? renderChunk(v) : ''}
        </span>
      ))}
      {'}'}
    </span>
  );
}

export function ChunkView({ chunk }: { chunk: Chunk }) {
  return <>{renderChunk(chunk)}</>;
}

function renderChunk(chunk?: Chunk): ReactNode {
  if (!chunk) {
    return <>Ummmm</>;
  }
  switch (chunk.type) {
    case 'literal':
      return <LiteralView literal={chunk} />;
    case 'variants':
      return <VariantView variants={chunk} />;
  }
  return <div className="whitespace-pre-wrap">{JSON.stringify(chunk)}</div>;
}
