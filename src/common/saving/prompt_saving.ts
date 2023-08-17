import { getSavedPrompts } from './localstorage';

function saveExists(promptName: string): boolean {
  const saved = getSavedPrompts();
  return saved.some((prompt) => prompt.name === promptName);
}
