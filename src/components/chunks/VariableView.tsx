import { Variable, VariableFlavor } from '@rendering/parsed_types';
import { KeyPath, pathToString } from '@rendering/rendering_utils';
import { PromptView } from './PromptView';
import { Tooltip } from '@mui/material';

interface VariableProps extends KeyPath {
  variable: Variable;
}

const FLAVOR_TO_SYMBOL: Record<VariableFlavor, string> = {
  access: '',
  assignment: ' = ',
  assignmentImmediate: ' =! ',
  unknown: '¿¿',
};

export function VariableView({
  variable,
  path,
  fancy,
  ...props
}: VariableProps) {
  return (
    <Tooltip
      title={
        <div>
          ${'{'}
          {variable.name}
          {FLAVOR_TO_SYMBOL[variable.flavor]}
          {'}'}
          <br />
          {pathToString('variable', path)}
        </div>
      }
      color="primary">
      <span
        className={`${
          fancy
            ? '' //'border-rose-600 border-opacity-50 border-2 rounded-md flex-[0_1_fit-content] inline-flex'
            : ''
        } text-violet-300 font-bold p-1 items-end`}>
        {variable.value && (
          <PromptView
            path={[...path, 0]}
            prompt={variable.value[0]}
            fancy={fancy}
            {...props}
          />
        )}
      </span>
    </Tooltip>
  );
}
