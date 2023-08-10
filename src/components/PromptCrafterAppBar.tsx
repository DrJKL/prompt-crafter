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
} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { RENDER_TYPES, RenderType } from '../common/rendering/RenderType';

export interface PromptCrafterAppBarProps {
  renderType: RenderType;
  handleDisplayTypeChange: (event: SelectChangeEvent<RenderType>) => void;
  rotateSelect: () => void;
}
export function PromptCrafterAppBar({
  renderType,
  handleDisplayTypeChange,
  rotateSelect,
}: PromptCrafterAppBarProps) {
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
              value={renderType}
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
        <Typography
          className="flex-auto text-right select-none"
          variant="subtitle1">
          v0.0.2
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
