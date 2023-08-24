import { Token } from 'moo';
import { basicPromptLexer } from './sdprompt_lexer';
import { Grammar, Parser } from 'nearley';
import grammar from './sdprompt';
import { ParseResult } from '../rendering/parsed_types';

export function getPromptTokens(prompt: string): Token[] {
  try {
    basicPromptLexer.reset(prompt);
    return Array.from(basicPromptLexer);
  } catch (err: unknown) {
    console.error(err);
    return [];
  }
}

export function parsePrompt(prompt: string): ParseResult {
  const parser = new Parser(Grammar.fromCompiled(grammar));

  parser.feed(prompt);
  const allResults = parser.results;
  return allResults;
}
