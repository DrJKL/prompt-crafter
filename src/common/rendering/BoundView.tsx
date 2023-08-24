import { DEFAULT_BOUND, Variants } from './parsed_types';
import { pathToString, KeyPath } from './rendering_utils';

interface BoundProps extends KeyPath {
  variants: Variants;
}

export function BoundView({ path, variants }: BoundProps) {
  const { bound } = variants;
  const defaultRange =
    bound.min === DEFAULT_BOUND.min && //
    bound.max === DEFAULT_BOUND.max;
  const defaultSeparator = bound.separator === DEFAULT_BOUND.separator;

  const realMax = bound.max === -1 ? variants.variants.length : bound.max;

  const rangeSpan = (
    <span
      className="text-emerald-600"
      title={pathToString('bound-range', path)}>
      {bound.min}-{realMax} $$
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
      {defaultRange || rangeSpan}
      {defaultSeparator || separatorSpan}
    </>
  );
}
