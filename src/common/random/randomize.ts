import { shuffle } from 'lodash';
import {
  Bound,
  ParseResult,
  Prompt,
  Variants,
} from '../rendering/parsed_types';

export function randomizeAllResults(allResults: ParseResult): ParseResult {
  allResults.flat().forEach(randomizePromptInPlace);
  return allResults;
}

function randomizePromptInPlace(prompt: Prompt): void {
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

function randomizeVariantsInPlace(variants: Variants) {
  const { bound, variants: options } = variants;
  const count = getRandomInBounds(bound);
  const allSelections = allPossibleSelections(options.length);
  const shuffled = shuffle(allSelections);
  const selections = shuffled.slice(0, count);
  variants.selections = selections;
  selections.map((i) => options[i]).forEach((o) => randomizePromptInPlace(o));
}

function getRandomInBounds(bound: Bound) {
  return Math.floor(Math.random() * (bound.max - bound.min)) + bound.min;
}

function allPossibleSelections(length: number) {
  return Array.from({ length }, (_v, idx) => idx);
}
