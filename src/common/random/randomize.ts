import { Draft } from 'immer';
import {
  Bound,
  ParseResult,
  Prompt,
  Variable,
  Variants,
  Wildcard,
} from '../rendering/parsed_types';
import { PRNG } from 'seedrandom';
import { cloneDeep } from 'lodash';

type VariableMap = Record<
  string,
  { immediate: boolean; value: Draft<Prompt[]> }
>;

export function randomizeAllResults(
  allResults: Draft<ParseResult>,
  prng: PRNG,
): ParseResult {
  const variableMap: VariableMap = {};
  allResults
    .flat()
    .forEach((prompt) => randomizePromptInPlace(prompt, variableMap, prng));
  return allResults;
}

const directions = ['up', 'down', 'left', 'right'] as const;
export function randomDir() {
  return directions[Math.floor(Math.random() * 4)];
}

export function fixBound(bound: Bound, optionsCount: number): Bound {
  const max =
    bound.max > 0 && bound.max <= optionsCount ? bound.max : optionsCount;
  const min =
    bound.min > optionsCount ? optionsCount : bound.min > 0 ? bound.min : 1;
  return { ...bound, min, max };
}

function randomizePromptInPlace(
  prompt: Draft<Prompt>,
  variableMap: VariableMap,
  prng: PRNG,
): void {
  for (const chunk of prompt) {
    switch (chunk.type) {
      case 'group':
        randomizePromptInPlace(chunk.chunks, variableMap, prng);
        break;
      case 'variants':
        randomizeVariantsInPlace(chunk, variableMap, prng);
        break;
      case 'wildcard':
        randomizeVariantsInPlace(chunk, variableMap, prng);
        break;
      case 'variable':
        randomizeOrPopulateVariable(chunk, variableMap, prng);
        break;
    }
  }
}

function randomizeVariantsInPlace(
  variants: Draft<Variants | Wildcard>,
  variableMap: VariableMap,
  prng: PRNG,
) {
  const { bound, variants: options } = variants;
  const count = getRandomInBounds(bound, options.length, prng);
  const allSelections = allPossibleSelections(options.length);
  const shuffled = shuffle(allSelections, prng);
  const selections = shuffled.slice(0, count);
  variants.selections = selections;
  selections
    .map((i) => options[i])
    .forEach((o) => randomizePromptInPlace(o, variableMap, prng));
}

function randomizeOrPopulateVariable(
  variable: Draft<Variable>,
  variableMap: VariableMap,
  prng: PRNG,
) {
  console.log('v=', JSON.parse(JSON.stringify(variable)));
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
  if (variable.value) {
    variable.value.forEach((v) => randomizePromptInPlace(v, variableMap, prng));
  }
}

function getRandomInBounds(bound: Bound, optionsCount: number, prng: PRNG) {
  const { min, max } = fixBound(bound, optionsCount);
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
