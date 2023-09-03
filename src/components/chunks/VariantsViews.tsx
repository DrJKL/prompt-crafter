import { BoundView } from '@components/chunks/BoundView';
import { ChunkView } from '@components/chunks/ChunkView';
import { Close } from '@mui/icons-material';
import {
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Slide,
} from '@mui/material';
import { fixBound } from '@pc-random/randomize';
import { animated, easings, useTransition } from '@react-spring/web';
import { PromptView } from '@components/chunks/PromptView';
import { Variants } from '@rendering/parsed_types';
import { KeyPath, pathToString } from '@rendering/rendering_utils';
import { xor } from 'lodash';
import { ChangeEvent, MouseEvent, useMemo, useRef, useState } from 'react';

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

  const { separator, min, max } = fixBound(
    variants.bound,
    variants.variants.length,
  );

  const fullSelection = variants.selections.length >= max;
  const enoughSelected = variants.selections.length >= min;

  const variant = variants.variants.filter((_v, i) =>
    variants.selections.includes(i),
  );

  const variantRef = useMemo(() => new WeakMap(), []);

  const transitions = useTransition(variant, {
    from: { width: 0, opacity: 0 },
    enter: (item) => async (next) => {
      await next({ width: variantRef.get(item).offsetWidth, opacity: 1 });
      await next({ width: 'unset', opacity: 1 });
    },
    leave: { width: 0, opacity: 0 },
    config: {
      duration: 250,
      tension: 180,
      friction: 12,
      easing: easings.easeInOutElastic,
    },
    exitBeforeEnter: true,
  });

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
        className={`align-baseline text-pink-500 font-bold cursor-pointer transition-all flex-[0_1_fit-content] inline-flex flex-wrap gap-1 ${
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
        {transitions((styles, v, _state, idx) => {
          return (
            <animated.span style={styles} key={idx}>
              <span
                className="inline-flex flex-wrap gap-1"
                ref={(el) => variantRef.set(v, el)}>
                {idx > 0 && separator && <span>{separator}</span>}
                <PromptView
                  prompt={v}
                  path={path}
                  fancy={fancy}
                  dense={dense}
                  updateSelection={updateSelection}
                />
              </span>
            </animated.span>
          );
        })}
        {!variant.length && '...'}
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
        {variants.variants.map((v, idx) => {
          const newPath = [...path, idx];
          const isSelected = variants.selections.includes(idx);
          return (
            <MenuItem
              disableRipple
              disabled={fullSelection && !isSelected}
              value={idx}
              sx={[
                {
                  borderBottom: '2px inset #FFF6',
                  padding: '0',
                },
                {
                  '& .MuiTypography-root': {
                    whiteSpace: 'normal',
                  },
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
