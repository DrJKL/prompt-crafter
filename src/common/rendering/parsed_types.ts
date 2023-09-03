export type Chunk =
  | Wildcard
  | Literal
  | Variants
  | Group
  | Variable
  | CommentLine;
export type ChunkType = Chunk['type'];

export type Prompt = readonly Chunk[]; // List of Chunks

export type ParseResult = readonly Prompt[][];

export interface Wildcard extends Omit<Variants, 'type'> {
  readonly type: 'wildcard';
  readonly path: string;
}

export interface Literal {
  readonly type: 'literal';
  readonly value: string;
}
export interface Group {
  readonly type: 'group';
  readonly chunks: Prompt;
  readonly weight: number;
}

export interface Variants {
  readonly type: 'variants';
  readonly bound: Bound;
  readonly variants: readonly Prompt[];

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

export type VariableFlavor =
  | 'assignment'
  | 'assignmentImmediate'
  | 'access'
  | 'accessWithDefault'
  | 'unknown';

export interface Variable {
  readonly type: 'variable';
  readonly name: string;
  readonly value: Prompt[] | undefined;
  readonly flavor: VariableFlavor;
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
  separator: ',',
};

export interface CommentLine {
  readonly type: 'comment';
  readonly value: string;
}
