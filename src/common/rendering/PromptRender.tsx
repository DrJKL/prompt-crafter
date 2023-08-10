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
    case 'parsed-formatted':
      return formattedParseView(prompt);
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

function formattedParseView(prompt: string) {
  const parser = new Parser(Grammar.fromCompiled(grammar));
  try {
    parser.feed(prompt);
    const [results]: Array<Array<object>> = parser.results; // Strip outer Array
    return results.map((item) => (
      <div className="whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</div>
    ));
  } catch (error: unknown) {
    return (
      <div>
        <h1>Failed to parse</h1>
        <div className="errorMessage">{`${error}`}</div>
      </div>
    );
  }
}