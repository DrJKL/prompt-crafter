import { Draft, current } from 'immer';
import { ParseResult, Prompt } from './rendering/parsed_types';
import { randomizeAllResults } from './random/randomize';
import { PRNG } from 'seedrandom';

export type ModifyPromptAction =
  | { type: 'reset'; results: ParseResult }
  | { type: 'randomize'; prng: PRNG }
  | { type: 'choose-variant'; path: number[]; selection: number[] };

export function variantSelectionReducer(
  draft: Draft<ParseResult>,
  action: ModifyPromptAction,
) {
  switch (action.type) {
    case 'reset':
      return action.results;
    case 'choose-variant':
      return modifySelection(draft, action.path, action.selection);
    case 'randomize':
      randomizeAllResults(draft, action.prng);
      return;
  }
  action satisfies never;
  return draft;
}

function modifySelection(
  draft: Draft<ParseResult>,
  path: number[],
  selection: number[],
) {
  const undraft = current(draft);
  const firstParse = draft[0];
  if (!firstParse) {
    console.error(`Can't modify selection, bad Chunks provided: ${undraft}`);
    return draft;
  }
  let chunkCursor: Draft<Prompt>[] = firstParse;
  for (let i = 0; i < path.length - 2; i += 2) {
    if (path[i] < 0 || path[i + 1] < 0) {
      return;
    }
    const chunk = chunkCursor[path[i]];
    const nextVariants = chunk[path[i + 1]];
    if (nextVariants?.type !== 'variants') {
      console.error(`Found non-variable sub-path when trying to update
      ${chunk} in
      ${draft} with path
      ${path}`);

      return draft;
    }
    chunkCursor = [...nextVariants.variants];
  }
  try {
    const leafHopefully =
      chunkCursor[path[path.length - 2]][path[path.length - 1]];
    if (leafHopefully?.type === 'variants') {
      leafHopefully.selections = selection;
      return;
    }
    console.error(
      'Something has gone horribly awry',
      JSON.parse(JSON.stringify(leafHopefully)),
    );
  } catch (err: unknown) {
    console.error(err);
  }
}
