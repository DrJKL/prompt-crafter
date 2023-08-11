export type ChunkType = 'literal' | 'variants' | 'wildcard';
export type Chunk = Wildcard | Literal | Variants;

export interface Wildcard {
  readonly type: 'wildcard';
  readonly path: string;
}

export interface Literal {
  readonly type: 'literal';
  readonly value: string;
}

export interface Variants {
  readonly type: 'variants';
  readonly bound: Bound;
  readonly variants: readonly Chunk[][];

  /**
   * Indices for variant selections.
   * Indices should be between -1 and variants.length - 1
   * Length of selections should be
   *   - <= min(bound.max, variants.length)
   * There should be >= max(min, 1) non-negative indices
   *
   */
  readonly selections: readonly number[];
}

export interface Bound {
  readonly type: 'bound';
  readonly min: number;
  readonly max: number;
  readonly separator: string;
}

export const DEFAULT_BOUND: Bound = {
  type: 'bound',
  min: 1,
  max: 1,
  separator: ', ',
};
