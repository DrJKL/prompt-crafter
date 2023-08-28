import { RenderingOptions } from './../rendering/RenderType';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { scan, takeUntil } from 'rxjs/operators';

import {
  RenderingOptionsSchema,
  SavedPrompt,
  SavedPrompts,
  SavedPromptsSchema,
} from './types';
import { getDefaultPrompts } from '../../examples/prompts';

/** Keys */
const ACTIVE_PROMPT_NAME = 'pc.active_prompt.name' as const;
const ACTIVE_PROMPT_TAGS = 'pc.active_prompt.tags' as const;
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

export function getActivePromptNameLocal(): string {
  return localStorage.getItem(ACTIVE_PROMPT_NAME) ?? '';
}
function saveActivePromptNameLocal(promptName: string) {
  localStorage.setItem(ACTIVE_PROMPT_NAME, promptName);
}

export function getActivePromptTagsLocal(): string[] {
  return JSON.parse(localStorage.getItem(ACTIVE_PROMPT_TAGS) ?? '[]');
}
function saveActivePromptTagsLocal(promptTags: string[]) {
  localStorage.setItem(ACTIVE_PROMPT_TAGS, JSON.stringify(promptTags));
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

function savePromptsLocal(newPrompts: SavedPrompts) {
  localStorage.setItem(SAVED_PROMPTS, JSON.stringify(newPrompts));
}

export function getSavedPromptsLocal(): SavedPrompts {
  const currentValue = localStorage.getItem(SAVED_PROMPTS);
  const parsedMaybe = SavedPromptsSchema.safeParse(
    JSON.parse(currentValue ?? '[]'),
  );
  if (parsedMaybe.success) {
    if (parsedMaybe.data.length === 0) {
      return getDefaultPrompts();
    }
    return parsedMaybe.data;
  }
  console.error(parsedMaybe.error);
  return [];
}

/* Local state */
const activePromptSubject = new BehaviorSubject(getActivePromptLocal());
const activePromptNameSubject = new BehaviorSubject(getActivePromptNameLocal());
const activePromptTagsSubject = new BehaviorSubject(getActivePromptTagsLocal());
const savedPromptInputSubject = new Subject<SavedPrompt>();

const savedPromptsComposed = savedPromptInputSubject.pipe(
  scan(
    (existingPrompts, newPrompt) => [...existingPrompts, newPrompt],
    getSavedPromptsLocal(),
  ),
);

/* Exports */
export const cleanupLocalStorageSubscriptions$ = new ReplaySubject<void>();

export const activePrompt$: Observable<string> = activePromptSubject;
export function saveActivePrompt(promptText: string) {
  activePromptSubject.next(promptText);
}
export const activePromptName$: Observable<string> = activePromptNameSubject;
export function saveActivePromptName(promptName: string) {
  activePromptNameSubject.next(promptName);
}
export const activePromptTags$: Observable<string[]> = activePromptTagsSubject;
export function saveActivePromptTags(promptTags: string[]) {
  activePromptTagsSubject.next(promptTags);
}
export const savedPrompts$: Observable<SavedPrompts> = savedPromptsComposed;
export function savePrompt(prompt: SavedPrompt) {
  savedPromptInputSubject.next(prompt);
}
/* Persistence */
activePrompt$
  .pipe(takeUntil(cleanupLocalStorageSubscriptions$))
  .subscribe((prompt) => {
    saveActivePromptLocal(prompt);
  });

activePromptName$
  .pipe(takeUntil(cleanupLocalStorageSubscriptions$))
  .subscribe((name) => {
    saveActivePromptNameLocal(name);
  });

activePromptTags$
  .pipe(takeUntil(cleanupLocalStorageSubscriptions$))
  .subscribe((tags) => {
    saveActivePromptTagsLocal(tags);
  });

savedPrompts$
  .pipe(takeUntil(cleanupLocalStorageSubscriptions$))
  .subscribe((newPrompts) => {
    savePromptsLocal(newPrompts);
  });
