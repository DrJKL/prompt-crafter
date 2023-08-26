import { Draft } from 'immer';
import {
  Bound,
  ParseResult,
  Prompt,
  Variants,
} from '../rendering/parsed_types';
import seedrandom from 'seedrandom';

export function randomizeAllResults(
  allResults: Draft<ParseResult>,
): ParseResult {
  allResults.flat().forEach(randomizePromptInPlace);
  return allResults;
}

function randomizePromptInPlace(prompt: Draft<Prompt>): void {
  for (const chunk of prompt) {
    switch (chunk.type) {
      case 'group':
        randomizePromptInPlace(chunk.chunks);
        break;
      case 'variants':
        randomizeVariantsInPlace(chunk);
        break;
      case 'wildcard':
        // TODO
        break;
    }
  }
}

// /*
const prng = seedrandom.alea('so random.');
/*/
const prng = Math.random;
//*/

function randomizeVariantsInPlace(variants: Draft<Variants>) {
  const { bound, variants: options } = variants;
  const count = getRandomInBounds(bound);
  const allSelections = allPossibleSelections(options.length);
  const shuffled = shuffle(allSelections);
  const selections = shuffled.slice(0, count);
  variants.selections = selections;
  selections.map((i) => options[i]).forEach((o) => randomizePromptInPlace(o));
}

function getRandomInBounds(bound: Bound) {
  return Math.floor(prng() * (bound.max - bound.min)) + bound.min;
}

function allPossibleSelections(length: number) {
  return Array.from({ length }, (_v, idx) => idx);
}
function shuffle<T>(array: T[]) {
  const length = array?.length ?? 0;
  if (!length) {
    return [];
  }
  let index = -1;
  const lastIndex = length - 1;
  const result = [...array];
  while (++index < length) {
    const rand = index + Math.floor(prng() * (lastIndex - index + 1));
    [result[rand], result[index]] = [result[index], result[rand]];
  }
  return result;
}
