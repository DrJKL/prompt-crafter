import { SelectionUpdateFn } from './PromptRender';

export interface KeyPath {
  path: number[];
  updateSelection: SelectionUpdateFn;
  fancy: boolean;
}

export function pathToString(prefix: string, path: number[]): string {
  return `${prefix}-${path.join('-')}`;
}
