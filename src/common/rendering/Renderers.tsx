import { ReactNode } from 'react';
import { Bound, Chunk, Literal, Variants } from './parsed_types';
import { MenuItem, Select } from '@mui/material';

interface KeyPath {
  path: number[];
}

interface LiteralProps extends KeyPath {
  literal: Literal;
}

interface VariantProps extends KeyPath {
  variants: Variants;
}

interface BoundProps extends KeyPath {
  bound: Bound;
}

interface ChunkProps extends KeyPath {
  chunk: Chunk;
}

export function LiteralView({ literal }: LiteralProps) {
  return (
    <span className="text-pink-400 font-bold cursor-pointer hover:text-pink-700">
      {literal.value}
    </span>
  );
}

export function VariantView({ variants, path }: VariantProps) {
  return (
    <span className="text-blue-400">
      {' { '}
      {variants.bound && <BoundView bound={variants.bound} path={path} />}
      {variants.variants?.map((v, idx) => {
        const newPath = [...path, idx];
        return (
          <span className="variant-option" key={`variant-${newPath.join('-')}`}>
            {idx > 0 ? ' | ' : ''}
            {v ? renderChunk(v) : ''}
          </span>
        );
      })}
      {' } '}
    </span>
  );
}

export function FancyVariantView({ variants, path }: VariantProps) {
  return (
    <Select
      className="text-blue-400"
      size="small"
      sx={{
        '& .MuiSelect-select': {
          // background: 'blue',
        },
        '& .MuiInputBase-root': {
          display: 'inline',
        },
      }}
      defaultValue={0}
      onChangeCapture={(e) => console.log(e)}>
      {variants.variants?.map((v, idx) => {
        const newPath = [...path, idx];
        return (
          <MenuItem
            className="variant-option"
            value={idx}
            key={`fancy-variant-${newPath.join('-')}`}>
            {v ? renderChunk(v, newPath) : null}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export function BoundView({ bound }: BoundProps) {
  const defaultRange = bound.min === 1 && bound.max === 1;
  const defaultSeparator = bound.separator === ', ';

  const rangeSpan = (
    <span className="text-emerald-600">
      {bound.min}-{bound.max} $$
    </span>
  );

  const separatorSpan = (
    <span className="text-emerald-400">{bound.separator}$$ </span>
  );
  return (
    <>
      {defaultRange ? null : rangeSpan}
      {defaultSeparator ? null : separatorSpan}
    </>
  );
}

export function ChunkView({ chunk, path }: ChunkProps) {
  return <>{renderChunk(chunk, path)}</>;
}

function renderChunk(chunk?: Chunk, path = [0]): ReactNode {
  if (!chunk) {
    return <>Ummmm</>;
  }
  switch (chunk.type) {
    case 'literal':
      return <LiteralView literal={chunk} path={path} />;
    case 'variants':
      return <FancyVariantView variants={chunk} path={path} />;
    case 'bound':
      return <BoundView bound={chunk} path={path} />;
  }
  return (
    <div className="whitespace-pre-wrap bg-red-600 bg-opacity-50 text-white">
      {JSON.stringify(chunk)}
    </div>
  );
}
