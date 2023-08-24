import { Literal } from './parsed_types';
import { KeyPath, pathToString } from './Renderers';

interface LiteralProps extends KeyPath {
  literal: Literal;
}

export function LiteralView({ literal, path }: LiteralProps) {
  return (
    <span
      className="text-pink-400 font-bold"
      title={pathToString('literal', path)}>
      {literal.value.trim()}
    </span>
  );
}
