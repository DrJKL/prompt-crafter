export type ChunkType = 'literal' | 'variants' | 'wildcard';

export interface Wildcard {
  readonly type: 'wildcard';
  readonly path: string;
}

export interface Literal {
  readonly type: 'literal';
  readonly value: string;
}
export interface Bound {
  readonly type: 'bound';
  readonly min: number;
  readonly max: number;
}

export interface Variants {
  readonly type: 'variants';
  readonly bound: Bound;
  variants: ReadonlyArray<Literal | Variants | Wildcard>;
}
