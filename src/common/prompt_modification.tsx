import { Draft, createDraft, current, finishDraft } from 'immer';
import { ParseResult, Prompt, Wildcard } from './rendering/parsed_types';
import { randomizeAllResults } from './random/randomize';
import { PRNG } from 'seedrandom';
import { wildcardFiles$ } from '@wildcard-browser/src/lib/wildcards';
import { firstValueFrom } from 'rxjs';
import { filter, endWith, first, map } from 'rxjs/operators';
import { parsePrompt } from './parsing/app_parsing';

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

export async function fillOutWildcards(
  allResults: ParseResult,
): Promise<ParseResult> {
  const draft = createDraft(allResults);
  await Promise.all(
    draft.flat().map(async (prompt) => await fillOutChunkInPlace(prompt)),
  );
  return finishDraft(draft);
}

async function fillOutChunkInPlace(prompt: Draft<Prompt>): Promise<void> {
  for (const chunk of prompt) {
    switch (chunk.type) {
      case 'group':
        await fillOutChunkInPlace(chunk.chunks);
        break;
      case 'variants':
        await Promise.all(
          chunk.variants.map(async (c) => await fillOutChunkInPlace(c)),
        );
        break;
      case 'wildcard':
        await fillOutWildcardInPlace(chunk);
        break;
    }
  }
}

async function fillOutWildcardInPlace(wildcard: Draft<Wildcard>) {
  const wildcardEntries = await firstValueFrom(
    wildcardFiles$.pipe(
      filter((w) => w.filepath.includes(wildcard.path)),
      map((w) => w.wildcardEntries),
      endWith(['NO_WILDCARDS_FOUND']),
      first(),
    ),
  );
  const parsedEntries = await Promise.all(
    wildcardEntries.map((e) => parsePrompt(e)).map(fillOutWildcards),
  );

  wildcard.variants = [
    ...parsedEntries.map(([[parseResult]]) => createDraft(parseResult)),
  ];
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
