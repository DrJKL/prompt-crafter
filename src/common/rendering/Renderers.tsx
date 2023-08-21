import { MouseEvent, ReactNode, useState } from 'react';
import { Bound, Chunk, Group, Literal, Variants } from './parsed_types';
import { MenuItem, Menu } from '@mui/material';

interface KeyPath {
  path?: number[];
  handleChange?: (path: number[]) => void;
  fancy?: boolean;
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

interface GroupProps extends KeyPath {
  group: Group;
}

function LiteralView({ literal }: LiteralProps) {
  return <span className="text-pink-400 font-bold">{literal.value}</span>;
}

function VariantView({ variants, path = [0], fancy }: VariantProps) {
  return (
    <span className="text-blue-400">
      {' { '}
      {variants.bound && <BoundView bound={variants.bound} path={path} />}
      {variants.variants?.flat().map((v, idx) => {
        const newPath = [...path, idx];
        return (
          <span className="variant-option" key={`variant-${newPath.join('-')}`}>
            {idx > 0 ? ' | ' : ''}
            {v ? ChunkView({ chunk: v, fancy, path: newPath }) : ''}
          </span>
        );
      })}
      {' } '}
    </span>
  );
}

function toText(chunk: Chunk | undefined, keyPath: KeyPath): ReactNode {
  switch (chunk?.type) {
    case 'literal':
      return chunk.value;
    case 'wildcard':
      return chunk.path;
    case 'group':
      return chunk.chunks.map((subChunk, idx) => {
        const newPath = [...(keyPath.path ?? []), idx];
        return (
          <ChunkView
            chunk={subChunk}
            key={`group-chunk-${newPath.join('-')}`}
            {...keyPath}
          />
        );
      });
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

function FancyVariantView({
  variants,
  path = [0],
  handleChange,
  fancy,
}: VariantProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
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

  function selectVariant(event: MouseEvent, chunk: Chunk, idx: number) {
    event.stopPropagation();
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
      <span
        className={`text-pink-500 font-bold cursor-pointer transition-all hover:text-pink-800 ${
          fancy
            ? 'border-pink-500 border-2 rounded-md p-0.5 hover:border-pink-200'
            : ''
        }`}
        aria-roledescription="button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        title={JSON.stringify(variants)}
        onClick={handleClick}>
        {variant &&
          ChunkView({
            chunk: variant,
            path,
            handleChange,
            fancy,
          })}
      </span>

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
              disableRipple
              value={idx}
              sx={{
                '&:has( > a )': {
                  // This will probably be broken in Firefox (without a config set for :has)
                  padding: 0,
                  '& > a': {
                    padding: '6px 16px',
                  },
                },
              }}
              onClick={(event) => selectVariant(event, v, idx)}
              key={`fancy-variant-${newPath.join('-')}`}>
              {v &&
                ChunkView({
                  chunk: v,
                  path: newPath,
                  handleChange: handleChangeInternal(idx),
                  fancy,
                })}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

function BoundView({ bound }: BoundProps) {
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

function GroupView({ group, path = [0], handleChange, fancy }: GroupProps) {
  if (!group.chunks) {
    return <div>This isn't a group: {`${JSON.stringify(group)}`}</div>;
  }
  return (
    <span
      className={`${
        fancy
          ? 'border-red-500 border-opacity-50 border-2 rounded-md p-0.5'
          : ''
      } text-purple-200 font-bold`}>
      (
      {group.chunks?.map((chunk, idx) => {
        const newPath = [...path, idx];
        return (
          <ChunkView
            chunk={chunk}
            key={`group-${newPath.join('-')}`}
            path={newPath}
            handleChange={handleChange}
            fancy={fancy}
          />
        );
      })}
      :{group.weight})
    </span>
  );
}

export function ChunkView({
  chunk,
  path = [0],
  handleChange,
  fancy,
}: ChunkProps): ReactNode {
  if (!chunk) {
    return <>Ummmm...</>;
  }
  switch (chunk.type) {
    case 'literal':
      return <LiteralView literal={chunk} fancy={fancy} path={path} />;
    case 'variants':
      return fancy ? (
        <FancyVariantView
          variants={chunk}
          path={path}
          fancy={fancy}
          handleChange={handleChange}
        />
      ) : (
        <VariantView
          variants={chunk}
          path={path}
          fancy={fancy}
          handleChange={handleChange}
        />
      );
    case 'wildcard':
      return <span className="text-amber-600">{chunk.path}</span>;
    case 'group':
      return (
        <GroupView
          path={path}
          fancy={fancy}
          group={chunk}
          handleChange={handleChange}
        />
      );
  }
  return (
    <div className="whitespace-pre-wrap bg-red-600 bg-opacity-50 text-white">
      {JSON.stringify(chunk)}
    </div>
  );
}
