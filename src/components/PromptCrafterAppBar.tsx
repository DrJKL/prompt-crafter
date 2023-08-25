import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Slide,
  Tooltip,
} from '@mui/material';
import { CopyAll, NavigateNext, Shuffle } from '@mui/icons-material';
import {
  RENDER_TYPES,
  RenderType,
  RenderingOptions,
  isRenderType,
} from '../common/rendering/RenderType';
import { Updater } from 'use-immer';

export interface PromptCrafterAppBarProps {
  rotateSelect: () => void;
  renderingOptions: RenderingOptions;
  setRenderingOptions: Updater<RenderingOptions>;
  copyText: () => void;
  randomizePrompt: () => void;
}
export function PromptCrafterAppBar({
  rotateSelect,
  renderingOptions,
  setRenderingOptions,
  copyText,
  randomizePrompt,
}: PromptCrafterAppBarProps) {
  function handleDisplayTypeChange(event: SelectChangeEvent<RenderType>) {
    const value: unknown = event.target.value;
    if (isRenderType(value)) {
      setRenderingOptions((draft) => {
        draft.renderType = value;
      });
    }
  }
  return (
    <AppBar position="static">
      <Toolbar className="flex flex-auto justify-between">
        <Typography
          className="flex-auto select-none"
          variant="h5"
          component="h1">
          Prompt Crafter
        </Typography>
        <span className="flex flex-1">
          <FormControl size="small" className="flex-1">
            <InputLabel>Render Type</InputLabel>
            <Select
              label="Render Type"
              name="display-type"
              value={renderingOptions.renderType}
              autoWidth={true}
              onChange={handleDisplayTypeChange}>
              {RENDER_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type
                    .split('-')
                    .map((e) => e.replace(e[0], e[0].toUpperCase()))
                    .join(' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton aria-label="" onClick={rotateSelect}>
            <NavigateNext />
          </IconButton>
        </span>
        <Slide in={renderingOptions.renderType === 'parsed-formatted'}>
          <span className="flex">
            <span className="flex-1 items-center flex">
              <FormControlLabel
                label="Fancy?"
                labelPlacement="end"
                control={
                  <Switch
                    value=""
                    checked={renderingOptions.fancy}
                    onChange={() =>
                      setRenderingOptions((draft) => {
                        draft.fancy = !draft.fancy;
                      })
                    }
                  />
                }
              />
            </span>
            <span className="flex-1 items-center flex">
              <FormControlLabel
                label="Dense?"
                labelPlacement="end"
                control={
                  <Switch
                    value=""
                    checked={renderingOptions.dense}
                    onChange={() =>
                      setRenderingOptions((draft) => {
                        draft.dense = !draft.dense;
                      })
                    }
                  />
                }
              />
            </span>
          </span>
        </Slide>
        <span className="flex-shrink pr-2 flex justify-end">
          <Tooltip title="Copy current (rendered) prompt">
            <IconButton aria-label="Copy prompt" onClick={copyText}>
              <CopyAll />
            </IconButton>
          </Tooltip>
        </span>
        <span className="flex-shrink pr-2 flex justify-end">
          <Tooltip title="Shuffle current (rendered) prompt">
            <IconButton aria-label="Shuffle prompt" onClick={randomizePrompt}>
              <Shuffle />
            </IconButton>
          </Tooltip>
        </span>
        <Typography
          className="flex-shrink text-right select-none"
          variant="subtitle1">
          v0.0.3
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
