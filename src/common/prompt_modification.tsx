import { Draft, createDraft, current, finishDraft } from 'immer';
import {
  ParseResult,
  Prompt,
  Variable,
  Wildcard,
} from './rendering/parsed_types';
import { VariableMap, randomizeAllResults } from './random/randomize';
import { PRNG } from 'seedrandom';
import { wildcardFiles$ } from '@wildcard-browser/src/lib/wildcards';
import { firstValueFrom } from 'rxjs';
import { filter, map, reduce } from 'rxjs/operators';
import { parsePrompt } from './parsing/app_parsing';
import { cloneDeep } from 'lodash';

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

export async function fillOutWildcardsAndVariables(
  allResults: ParseResult,
): Promise<ParseResult> {
  const draft = createDraft(allResults);
  const variableMap: VariableMap = {};
  await Promise.all(
    draft
      .flat()
      .map(async (prompt) => await fillOutChunkInPlace(prompt, variableMap)),
  );
  return finishDraft(draft);
}

async function fillOutChunkInPlace(
  prompt: Draft<Prompt>,
  variableMap: VariableMap,
): Promise<void> {
  for (const chunk of prompt) {
    switch (chunk.type) {
      case 'group':
        await fillOutChunkInPlace(chunk.chunks, variableMap);
        break;
      case 'variants':
        await Promise.all(
          chunk.variants.map(
            async (c) => await fillOutChunkInPlace(c, variableMap),
          ),
        );
        break;
      case 'wildcard':
        await fillOutWildcardInPlace(chunk);
        break;
      case 'variable':
        await populateVariable(chunk, variableMap);
    }
  }
}

async function fillOutWildcardInPlace(wildcard: Draft<Wildcard>) {
  const searchRegex = new RegExp(wildcard.path.replace('*', '.+'));
  const wildcardEntries = await firstValueFrom(
    wildcardFiles$.pipe(
      filter((w) => searchRegex.test(w.filepath)),
      map((w) => w.wildcardEntries),
      reduce<readonly string[], readonly string[]>(
        (acc, cur) => [...acc, ...cur],
        [],
      ),
    ),
  );
  const parsedEntries = await Promise.all(
    wildcardEntries
      .map((e) => parsePrompt(e))
      .map(fillOutWildcardsAndVariables),
  );

  wildcard.variants = [
    ...parsedEntries.map(([[parseResult]]) => createDraft(parseResult)),
  ];
}

export function populateVariable(
  variable: Draft<Variable>,
  variableMap: VariableMap,
) {
  const { name, flavor, value } = variable;
  const currentValue = variableMap[name];
  switch (flavor) {
    case 'assignment':
    case 'assignmentImmediate':
      if (currentValue !== undefined) {
        console.warn(`Overriding variable ${name}, was ${currentValue}`);
      }
      if (value) {
        variableMap[name] = {
          immediate: flavor === 'assignmentImmediate',
          value,
        };
      }
      break;
    case 'access':
      if (currentValue) {
        variable.value = currentValue.immediate
          ? currentValue.value
          : cloneDeep(currentValue.value);
      }
      break;
    default:
      flavor satisfies 'unknown';
  }
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
    if (
      nextVariants?.type === 'variants' ||
      nextVariants?.type === 'wildcard'
    ) {
      chunkCursor = [...nextVariants.variants];
      continue;
    }
    if (nextVariants?.type === 'variable') {
      // TODO
      chunkCursor = nextVariants.value ?? [];
      continue;
    }
    console.error(`
    Found non-variable sub-path when trying to update
      ${JSON.stringify(chunk, null, 2)} in
      ${JSON.stringify(undraft, null, 2)} with path
      ${path}
      
      Found ${nextVariants?.type} instead`);

    return draft;
  }
  try {
    const leafHopefully =
      chunkCursor[path[path.length - 2]][path[path.length - 1]];
    if (
      leafHopefully?.type === 'variants' ||
      leafHopefully?.type === 'wildcard'
    ) {
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
