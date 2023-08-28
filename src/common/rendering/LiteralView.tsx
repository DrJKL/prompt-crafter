import { Literal } from './parsed_types';
import { KeyPath, pathToString } from './rendering_utils';

interface LiteralProps extends KeyPath {
  literal: Literal;
}

export function LiteralView({ literal, path }: LiteralProps) {
  return (
    <span
      className={`text-pink-400 font-bold flex-[0_1_fit-content]`}
      title={pathToString('literal', path)}>
      {literal.value}
    </span>
  );
}
