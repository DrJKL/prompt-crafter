import { RENDER_TYPES, RenderingOptions } from './../rendering/RenderType';
/** Keys */

import z from 'zod';

const ACTIVE_PROMPT = 'pc.active_prompt' as const;
const RENDER_OPTIONS = 'pc.rendering_options' as const;

export const DEFAULT_RENDERING_OPTIONS: RenderingOptions = {
  renderType: 'parsed-formatted',
  fancy: true,
  dense: true,
} as const;

const RenderingOptionsSchema = z.object({
  renderType: z.enum(RENDER_TYPES),
  fancy: z.boolean(),
  dense: z.boolean(),
}) satisfies z.ZodType<RenderingOptions>;

export function getActivePrompt(): string {
  return localStorage.getItem(ACTIVE_PROMPT) ?? '';
}

export function saveActivePrompt(promptText: string) {
  localStorage.setItem(ACTIVE_PROMPT, promptText);
}
export function getRenderingOptions(): RenderingOptions {
  const currentValue = localStorage.getItem(RENDER_OPTIONS);
  const parsedMaybe = RenderingOptionsSchema.safeParse(
    JSON.parse(currentValue ?? ''),
  );
  if (parsedMaybe.success) {
    return parsedMaybe.data;
  }
  console.error(parsedMaybe.error);
  return DEFAULT_RENDERING_OPTIONS;
}

export function saveRenderingOptions(renderingOptions: RenderingOptions) {
  localStorage.setItem(RENDER_OPTIONS, JSON.stringify(renderingOptions));
}
