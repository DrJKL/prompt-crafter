import { MouseEvent, ReactNode, useState } from 'react';
import { Bound, Chunk, Literal, Variants } from './parsed_types';
import { Button, MenuItem, Menu } from '@mui/material';

interface KeyPath {
  path: number[];
  handleChange?: (path: number[]) => void;
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
  return <span className="text-pink-400 font-bold ">{literal.value}</span>;
}

export function VariantView({ variants, path }: VariantProps) {
  return (
    <span className="text-blue-400">
      {' { '}
      {variants.bound && <BoundView bound={variants.bound} path={path} />}
      {variants.variants?.flat().map((v, idx) => {
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

function toText(chunk: Chunk | undefined): ReactNode {
  switch (chunk?.type) {
    case 'literal':
      return chunk.value;
    case 'wildcard':
      return chunk.path;
  }
  return null;
}

function getLiteralFromVariants(
  variants: Variants,
  path: readonly number[],
): Chunk | undefined {
  let currentSet = variants.variants.flat();
  for (const node of path) {
    const variantsMaybe = currentSet[node];
    if (variantsMaybe?.type !== 'variants') {
      return variantsMaybe;
    }
    currentSet = variantsMaybe.variants.flat();
  }
  return undefined;
}

export function FancyVariantView({
  variants,
  path,
  handleChange,
}: VariantProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }
  const [selectedVariant, setVariant] = useState([0]);
  const variant = getLiteralFromVariants(variants, selectedVariant);

  const changeHandler =
    handleChange ??
    function (path: number[]) {
      setVariant(path);
      handleClose();
    };

  function selectVariant(chunk: Chunk, idx: number) {
    if (chunk.type === 'variants') {
      return;
    }
    changeHandler([idx]);
  }

  function handleChangeInternal(idx: number) {
    return (path: number[]) => {
      changeHandler([idx, ...path]);
    };
  }

  return (
    <>
      <a
        className="text-pink-500 font-bold cursor-pointer hover:text-pink-800"
        aria-roledescription="button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        title={JSON.stringify(variants)}
        onClick={handleClick}>
        {toText(variant)}
      </a>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="text-blue-400">
        {variants.variants?.flat().map((v, idx) => {
          const newPath = [...path, idx];
          return (
            <MenuItem
              className="variant-option"
              value={idx}
              onClick={() => selectVariant(v, idx)}
              key={`fancy-variant-${newPath.join('-')}`}>
              {v ? renderChunk(v, newPath, handleChangeInternal(idx)) : null}
            </MenuItem>
          );
        })}
      </Menu>
    </>
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
  return renderChunk(chunk, path);
}

function renderChunk(
  chunk: Chunk,
  path = [0],
  handleChange?: (path: number[]) => void,
): ReactNode {
  if (!chunk) {
    return <>Ummmm</>;
  }
  switch (chunk.type) {
    case 'literal':
      return <LiteralView literal={chunk} path={path} />;
    case 'variants':
      return (
        <FancyVariantView
          variants={chunk}
          path={path}
          handleChange={handleChange}
        />
      );
    case 'wildcard':
      return <span className="text-amber-400">{chunk.path}</span>;
  }
  return (
    <div className="whitespace-pre-wrap bg-red-600 bg-opacity-50 text-white">
      {JSON.stringify(chunk)}
    </div>
  );
}
