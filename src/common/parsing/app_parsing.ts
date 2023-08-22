import { Token } from 'moo';
import { basicPromptLexer } from './sdprompt_lexer';
import { Grammar, Parser } from 'nearley';
import grammar from './sdprompt';
import { Chunk } from '../rendering/parsed_types';

export type ParseResult = Chunk[][][];

export function getPromptTokens(prompt: string): Token[] {
  basicPromptLexer.reset(prompt);
  return Array.from(basicPromptLexer);
}

export function parsePrompt(prompt: string): ParseResult {
  const parser = new Parser(Grammar.fromCompiled(grammar));

  parser.feed(prompt);
  const allResults = parser.results;
  return allResults;
}
