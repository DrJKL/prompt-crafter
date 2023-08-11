import {
  Bound,
  Chunk,
  ChunkType,
  DEFAULT_BOUND,
  Literal,
  Variants,
  Wildcard,
} from '../rendering/parsed_types';

export function countType(chunks: Chunk[], type: ChunkType): number {
  return chunks.filter((chunk) => chunk.type === type).length;
}
const BOUND_FORMAT = new RegExp(
  '(?<min>\\d+)?(?:(?<dash>-)(?<max>\\d+)?)?\\$\\$(?:(?<separator>[^$]+?)\\$\\$)?',
);

/* Chunks */

// eslint-disable-next-line
export function flattenVariantsList([firstVariant, restOfVariants]: any[]) {
  return [firstVariant[0], ...restOfVariants];
}

// eslint-disable-next-line
export function constructVariants([, boundMaybe, variants]: any[]): Variants {
  const bound = boundMaybe ?? DEFAULT_BOUND;
  const selections = generateDefaultSelection(bound, variants);
  return {
    type: 'variants',
    bound,
    variants,
    selections,
  };
}

// eslint-disable-next-line
export function constructLiteral([literalToken]: any[]): Literal {
  return {
    type: 'literal',
    value: literalToken.value,
  };
}

// eslint-disable-next-line
export function constructBound([boundString]: any[]): Bound {
  const matches = BOUND_FORMAT.exec(boundString.value);
  if (matches && matches.groups) {
    const hasDash = !!matches.groups['dash'];
    const minMaybe = safeNumberParse(matches.groups['min']);
    const maxMaybe = safeNumberParse(matches.groups['max']);
    const min = minMaybe ?? 1;
    const max = maxMaybe ?? (hasDash ? -1 : min);
    const separator = matches.groups['separator'] ?? ', ';
    return {
      type: 'bound',
      min,
      max,
      separator,
    };
  }
  return DEFAULT_BOUND;
}

// eslint-disable-next-line
export function constructWildcard([wildcardPath]: any[]): Wildcard {
  return {
    type: 'wildcard',
    path: wildcardPath.value,
  };
}

/* Types */
function safeNumberParse(value: string): number | undefined {
  const numberMaybe = Number(value);
  if (isNaN(numberMaybe)) {
    return undefined;
  }
  return numberMaybe;
}

function generateDefaultSelection(bound: Bound, variants: readonly Chunk[]) {
  const { min, max } = bound;
  const realMin = min <= 0 ? 1 : min;
  const realMax =
    max >= variants.length ? variants.length : max <= 0 ? variants.length : max;
  const length = realMax - realMin + 1;
  const selectionArray = Array.from({ length }, (_, idx) => idx);
  return selectionArray;
}
