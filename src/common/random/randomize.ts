import { Draft } from 'immer';
import {
  Bound,
  ParseResult,
  Prompt,
  Variants,
} from '../rendering/parsed_types';
import { PRNG } from 'seedrandom';

export function randomizeAllResults(
  allResults: Draft<ParseResult>,
  prng: PRNG,
): ParseResult {
  allResults.flat().forEach((prompt) => randomizePromptInPlace(prompt, prng));
  return allResults;
}

const directions = ['up', 'down', 'left', 'right'] as const;
export function randomDir() {
  return directions[Math.floor(Math.random() * 4)];
}

function randomizePromptInPlace(prompt: Draft<Prompt>, prng: PRNG): void {
  for (const chunk of prompt) {
    switch (chunk.type) {
      case 'group':
        randomizePromptInPlace(chunk.chunks, prng);
        break;
      case 'variants':
        randomizeVariantsInPlace(chunk, prng);
        break;
      case 'wildcard':
        // TODO
        break;
    }
  }
}

function randomizeVariantsInPlace(variants: Draft<Variants>, prng: PRNG) {
  const { bound, variants: options } = variants;
  const count = getRandomInBounds(bound, options.length, prng);
  const allSelections = allPossibleSelections(options.length);
  const shuffled = shuffle(allSelections, prng);
  const selections = shuffled.slice(0, count);
  variants.selections = selections;
  selections
    .map((i) => options[i])
    .forEach((o) => randomizePromptInPlace(o, prng));
}

function getRandomInBounds(bound: Bound, optionsCount: number, prng: PRNG) {
  const max =
    bound.max > 0 && bound.max <= optionsCount ? bound.max : optionsCount;
  const min =
    bound.min > optionsCount ? optionsCount : bound.min > 0 ? bound.min : 1;
  return Math.floor(prng() * (max + 1 - min)) + min;
}

function allPossibleSelections(length: number) {
  return Array.from({ length }, (_v, idx) => idx);
}

function shuffle<T>(array: T[], prng: PRNG) {
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
