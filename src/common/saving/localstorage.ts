import { RenderingOptions } from './../rendering/RenderType';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  RenderingOptionsSchema,
  SavedPrompt,
  SavedPrompts,
  SavedPromptsSchema,
} from './types';

/** Keys */
const ACTIVE_PROMPT = 'pc.active_prompt' as const;
const RENDER_OPTIONS = 'pc.rendering_options' as const;
const SAVED_PROMPTS = 'pc.saved_prompts' as const;

export const DEFAULT_RENDERING_OPTIONS: RenderingOptions = {
  renderType: 'parsed-formatted',
  fancy: true,
  dense: true,
} as const;

export function getActivePromptLocal(): string {
  return localStorage.getItem(ACTIVE_PROMPT) ?? '';
}
function saveActivePromptLocal(promptText: string) {
  localStorage.setItem(ACTIVE_PROMPT, promptText);
}

export function getRenderingOptions(): RenderingOptions {
  const currentValue = localStorage.getItem(RENDER_OPTIONS);
  const parsedMaybe = RenderingOptionsSchema.safeParse(
    JSON.parse(currentValue ?? '{}'),
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

export function savePrompt(newPrompt: SavedPrompt) {
  const existingSave = getSavedPrompts();
  const newSave = [...existingSave, newPrompt];
  localStorage.setItem(SAVED_PROMPTS, JSON.stringify(newSave));
}

export function getSavedPrompts(): SavedPrompts {
  const currentValue = localStorage.getItem(SAVED_PROMPTS);
  const parsedMaybe = SavedPromptsSchema.safeParse(
    JSON.parse(currentValue ?? '[]'),
  );
  if (parsedMaybe.success) {
    return parsedMaybe.data;
  }
  console.error(parsedMaybe.error);
  return [];
}

/* Local state */
const activePromptSubject = new BehaviorSubject(getActivePromptLocal());

/* Exports */
export const cleanupLocalStorageSubscriptions$ = new ReplaySubject<void>();
export const activePrompt$: Observable<string> = activePromptSubject;
export function saveActivePrompt(promptText: string) {
  activePromptSubject.next(promptText);
}

/* Persistence */
activePrompt$
  .pipe(takeUntil(cleanupLocalStorageSubscriptions$))
  .subscribe((prompt) => {
    saveActivePromptLocal(prompt);
  });
