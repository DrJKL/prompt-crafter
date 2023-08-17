import { z } from 'zod';
import { RENDER_TYPES, RenderingOptions } from '../rendering/RenderType';

export interface SavedPrompt {
  readonly name: string;
  readonly contents: string;
  readonly tags: readonly string[];
}

export type SavedPrompts = readonly SavedPrompt[];

const SavedPromptSchema = z.object({
  name: z.string(),
  contents: z.string(),
  tags: z.array(z.string()),
}) satisfies z.ZodType<SavedPrompt>;

export const SavedPromptsSchema = z.array(
  SavedPromptSchema,
) satisfies z.ZodType<SavedPrompts>;

export const RenderingOptionsSchema = z.object({
  renderType: z.enum(RENDER_TYPES),
  fancy: z.boolean(),
  dense: z.boolean(),
}) satisfies z.ZodType<RenderingOptions>;
