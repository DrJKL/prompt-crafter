import { Grammar, Parser } from 'nearley';
import grammar from '../sdprompt';
import { basicPromptLexer } from '../sdprompt_lexer';
import { RenderType } from './RenderType';

export function tokensView(prompt: string, renderType: RenderType) {
  basicPromptLexer.reset(prompt);
  switch (renderType) {
    case 'raw':
      return Array.from(basicPromptLexer).map((token) => (
        <span>{token.value}</span>
      ));
    case 'tokens':
      return Array.from(basicPromptLexer).map((token) => (
        <span>{token.type} </span>
      ));
    case 'parsed':
      return parseView(prompt);
  }
}

function parseView(prompt: string) {
  const parser = new Parser(Grammar.fromCompiled(grammar));
  try {
    parser.feed(prompt);
    return JSON.stringify(parser.results, null, 2);
  } catch (error: unknown) {
    return (
      <div>
        <h1>Failed to parse</h1>
        <div>{`${error}`}</div>
      </div>
    );
  }
}
