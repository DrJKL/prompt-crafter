import { ChangeEvent, Fragment, MouseEvent, useState } from 'react';
import { Group, Prompt, Variants } from './parsed_types';
import { MenuItem, Menu, Slide, Checkbox } from '@mui/material';
import { Close } from '@mui/icons-material';
import { xor } from 'lodash';
import { ChunkView } from './ChunkView';
import { pathToString, KeyPath } from './rendering_utils';
import { BoundView } from './BoundView';

interface PromptProps extends KeyPath {
  prompt: Prompt;
  separator: string;
}

interface VariantProps extends KeyPath {
  variants: Variants;
}

interface GroupProps extends KeyPath {
  group: Group;
}

export function VariantView({
  variants,
  path,
  fancy,
  updateSelection,
}: VariantProps) {
  return (
    <span className="text-blue-400" title={pathToString('basic-variant', path)}>
      {' { '}
      {variants.bound && (
        <BoundView
          bound={variants.bound}
          updateSelection={updateSelection}
          fancy={fancy}
          path={path}
        />
      )}
      {variants.variants?.flat().map((v, idx) => {
        const newPath = [...path, idx];
        return (
          <span
            className="variant-option"
            key={pathToString('variant', newPath)}>
            {idx > 0 ? ' | ' : ''}
            {v
              ? ChunkView({ chunk: v, fancy, path: newPath, updateSelection })
              : ''}
          </span>
        );
      })}
      {' } '}
    </span>
  );
}

export function FancyVariantView({
  variants,
  path,
  updateSelection,
  fancy,
}: VariantProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const fullSelection = variants.selections.length >= variants.bound.max;
  const enoughSelected = variants.selections.length >= variants.bound.min;

  const variant = variants.variants
    .filter((_v, i) => variants.selections.includes(i))
    .flat();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }
  function handleClose(
    // eslint-disable-next-line
    _event?: {},
    reason?: 'backdropClick' | 'escapeKeyDown',
  ) {
    if (reason === 'backdropClick' && !enoughSelected) {
      return;
    }

    setAnchorEl(null);
  }

  const changeHandler = function (path: number[], selection: number[]) {
    updateSelection(path, selection);
    handleClose();
  };

  function editSelections(
    _event: ChangeEvent<HTMLInputElement>,
    path: number[],
    idx: number,
  ) {
    const currentSelection = [...variants.selections];
    const targetItem = [idx];
    const newSelection = xor(currentSelection, targetItem);
    updateSelection(path, newSelection);
  }

  return (
    <>
      <button
        className={`variants-button mx-0.5 text-pink-500 font-bold cursor-pointer transition-all hover:text-pink-800 ${
          fancy
            ? 'border-pink-500 border-2 rounded-md px-1 py-0 hover:border-pink-200'
            : ''
        }`}
        aria-roledescription="button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        title={
          pathToString('fancy-variant', path) + ` : ${variants.selections}`
        }
        onClickCapture={handleClick}>
        {variant && (
          <PromptView
            prompt={variant}
            path={path}
            fancy={fancy}
            updateSelection={updateSelection}
            separator={variants.bound.separator}
          />
        )}
      </button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Slide}
        className="text-blue-400">
        <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 100 } }}>
          <span className="text-white opacity-100">
            Selected: {variants.selections.length}
            <br /> Minimum: {variants.bound.min}
            <br /> Maximum: {variants.bound.max}
          </span>
        </MenuItem>
        {variants.variants?.map((v, idx) => {
          const newPath = [...path, idx];
          const isSelected = variants.selections.includes(idx);
          return (
            <MenuItem
              disableRipple
              value={idx}
              sx={[
                {
                  borderBottom: '2px inset #FFF6',
                },
                isSelected && {
                  boxShadow: 'inset 0 0 4px 0 white',
                },
                {
                  '&:has( > .variants-button )': {
                    // This will probably be broken in Firefox (without a config set for :has)
                    padding: 0,
                    '& > .variants-button': {
                      marginInline: '1rem',
                    },
                  },
                },
              ]}
              key={pathToString('fancy-variant-option', newPath)}>
              <Checkbox
                checked={isSelected}
                disabled={fullSelection && !isSelected}
                onChange={(e) => editSelections(e, path, idx)}
              />
              <PromptView
                prompt={v}
                key={pathToString('variant-option', newPath)}
                path={newPath}
                updateSelection={changeHandler}
                fancy={fancy}
                separator=","
              />
            </MenuItem>
          );
        })}
        <MenuItem
          disabled={!enoughSelected}
          onClick={handleClose}
          sx={{
            textAlign: 'center',
            justifyContent: 'center',
            paddingBlockEnd: '0',
          }}>
          <Close />
        </MenuItem>
      </Menu>
    </>
  );
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

export function GroupView({ group, path, fancy, updateSelection }: GroupProps) {
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
            key={pathToString('group', newPath)}
            path={newPath}
            fancy={fancy}
            updateSelection={updateSelection}
          />
        );
      })}
      :{group.weight})
    </span>
  );
}
