import { ReactNode } from 'react';
import { Bound, Chunk, Literal, Variants } from './parsed_types';

export function LiteralView({ literal }: { literal: Literal }) {
  return <span className="text-pink-400 font-bold">{literal.value}</span>;
}

export function VariantView({ variants }: { variants: Variants }) {
  return (
    <span className="text-blue-400">
      {'{'}
      {variants.bound && <BoundView bound={variants.bound} />}
      {variants.variants?.map((v, idx) => (
        <span className="variant-option" key={`variant-${idx}`}>
          {idx > 0 ? ' | ' : ''}
          {v ? renderChunk(v) : ''}
        </span>
      ))}
      {'}'}
    </span>
  );
}
export function BoundView({ bound }: { bound: Bound }) {
  if (bound.min === 1 && bound.max === 1) {
    return null;
  }
  return (
    <span className="text-emerald-600">
      {bound.min}-{bound.max}$$
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
    case 'bound':
      return <BoundView bound={chunk} />;
  }
  return (
    <div className="whitespace-pre-wrap bg-red-600 bg-opacity-50 text-white">
      {JSON.stringify(chunk)}
    </div>
  );
}
