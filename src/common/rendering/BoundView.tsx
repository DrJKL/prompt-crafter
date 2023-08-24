import { Bound } from './parsed_types';
import { pathToString, KeyPath } from './rendering_utils';

interface BoundProps extends KeyPath {
  bound: Bound;
}

export function BoundView({ bound, path }: BoundProps) {
  const defaultRange = bound.min === 1 && bound.max === 1;
  const defaultSeparator = bound.separator === ', ';

  const rangeSpan = (
    <span
      className="text-emerald-600"
      title={pathToString('bound-range', path)}>
      {bound.min}-{bound.max} $$
    </span>
  );

  const separatorSpan = (
    <span
      className="text-emerald-400"
      title={pathToString('bound-separator', path)}>
      {bound.separator}$${' '}
    </span>
  );
  return (
    <>
      {defaultRange ? null : rangeSpan}
      {defaultSeparator ? null : separatorSpan}
    </>
  );
}
