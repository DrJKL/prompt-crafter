const RENDER_TYPES = ['raw', 'tokens', 'parsed'] as const;
export type RenderType = (typeof RENDER_TYPES)[number];

export function isRenderType(typeMaybe: unknown): typeMaybe is RenderType {
  return (
    typeof typeMaybe === 'string' &&
    RENDER_TYPES.some((type) => type === typeMaybe)
  );
}

export function nextType(currentType: RenderType): RenderType {
  const currentRender = RENDER_TYPES.indexOf(currentType);
  return RENDER_TYPES[(currentRender + 1) % RENDER_TYPES.length];
}
