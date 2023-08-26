import { Literal } from './parsed_types';
import { KeyPath, pathToString } from './rendering_utils';

interface LiteralProps extends KeyPath {
  literal: Literal;
}

export function LiteralView({ literal, path, dense }: LiteralProps) {
  return (
    <span
      className={`text-pink-400 font-bold`}
      title={pathToString('literal', path)}>
      {literal.value}
    </span>
  );
}
