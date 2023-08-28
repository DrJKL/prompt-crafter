import { ChangeEvent, Fragment, MouseEvent, useRef, useState } from 'react';
import { Variants } from './parsed_types';
import {
  MenuItem,
  Menu,
  Slide,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { xor } from 'lodash';
import { ChunkView } from './ChunkView';
import { pathToString, KeyPath } from './rendering_utils';
import { BoundView } from './BoundView';
import { PromptView } from './PromptView';

interface VariantProps extends KeyPath {
  variants: Variants;
}

export function VariantView({
  variants,
  path,
  fancy,
  dense,
  updateSelection,
}: VariantProps) {
  return (
    <span className="text-blue-400" title={pathToString('basic-variant', path)}>
      {' { '}
      {variants.bound && (
        <BoundView
          variants={variants}
          updateSelection={updateSelection}
          fancy={fancy}
          dense={dense}
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
            {v && (
              <ChunkView
                chunk={v}
                fancy={fancy}
                dense={dense}
                path={newPath}
                updateSelection={updateSelection}
              />
            )}
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
  dense,
}: VariantProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const transitionContainer = useRef<HTMLSpanElement>(null);

  const { separator, min, max } = variants.bound;

  const fullSelection = variants.selections.length >= max;
  const enoughSelected = variants.selections.length >= min;

  const variant = variants.variants.filter((_v, i) =>
    variants.selections.includes(i),
  );

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget.closest('span'));
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
      <span
        ref={transitionContainer}
        className="overflow-hidden transition-all w-fit">
        <span
          className={`align-baseline text-pink-500 font-bold cursor-pointer transition-all hover:text-pink-800 flex-[0_1_fit-content] ${
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
          {variant &&
            variant.map((v, idx) => (
              <Fragment key={idx}>
                {idx > 0 && separator && <span>{separator}</span>}
                <PromptView
                  prompt={v}
                  path={path}
                  fancy={fancy}
                  dense={dense}
                  updateSelection={updateSelection}
                />
              </Fragment>
            ))}
          {!variant.length && '...'}
        </span>
      </span>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Slide}
        className="text-blue-400">
        <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 100 } }}>
          <span className="text-white opacity-100">
            Selected: {variants.selections.length}
            <br /> Min-max: {min}-{max}
          </span>
        </MenuItem>
        {variants.variants?.map((v, idx) => {
          const newPath = [...path, idx];
          const isSelected = variants.selections.includes(idx);
          return (
            <MenuItem
              // disableRipple
              disabled={fullSelection && !isSelected}
              value={idx}
              sx={[
                {
                  borderBottom: '2px inset #FFF6',
                  padding: '0',
                },
                isSelected && {
                  boxShadow: 'inset 0 0 2px 0 white',
                },
              ]}
              key={pathToString('fancy-variant-option', newPath)}>
              <FormControlLabel
                sx={{ width: '100%', margin: '0' }}
                control={
                  <Checkbox
                    checked={isSelected}
                    disabled={fullSelection && !isSelected}
                    onChange={(e) => editSelections(e, path, idx)}
                  />
                }
                label={
                  <PromptView
                    prompt={v}
                    key={pathToString('variant-option', newPath)}
                    path={newPath}
                    updateSelection={updateSelection}
                    fancy={fancy}
                    dense={dense}
                  />
                }
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
