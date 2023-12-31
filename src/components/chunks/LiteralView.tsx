import { Literal } from '@rendering/parsed_types';
import { KeyPath, pathToString } from '@rendering/rendering_utils';

interface LiteralProps extends KeyPath {
  literal: Literal;
}

export function LiteralView({ literal, path, dense }: LiteralProps) {
  return (
    <span
      className={`text-pink-400 font-bold flex-[0_1_fit-content] ${
        dense ? '' : ''
      }`}
      title={pathToString('literal', path)}>
      {literal.value}
    </span>
  );
}
