import { Variants, Wildcard } from '@rendering/parsed_types';
import { KeyPath } from '@rendering/rendering_utils';
import { FancyVariantView, VariantView } from './VariantsViews';

interface WildcardProps extends KeyPath {
  wildcard: Wildcard;
}

export function WildcardView({
  wildcard,
  path,
  fancy,
  dense,
  updateSelection,
}: WildcardProps) {
  const asVariants: Variants = {
    ...wildcard,
    type: 'variants',
  };

  return fancy ? (
    <FancyVariantView
      path={path}
      updateSelection={updateSelection}
      variants={asVariants}
      dense={dense}
      fancy={fancy}
    />
  ) : (
    <VariantView
      path={path}
      updateSelection={updateSelection}
      variants={asVariants}
      dense={dense}
      fancy={fancy}
    />
  );
}
