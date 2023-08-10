import { Grammar, Parser } from 'nearley';
import grammar from '../parsing/sdprompt';
import { basicPromptLexer } from '../parsing/sdprompt_lexer';
import { RenderType } from './RenderType';
import { Chunk } from './parsed_types';
import { ChunkView } from './Renderers';

export function tokensView(prompt: string, renderType: RenderType) {
  basicPromptLexer.reset(prompt);
  switch (renderType) {
    case 'raw':
      return Array.from(basicPromptLexer).map((token) => (
        <span>{token.value}</span>
      ));
    case 'tokens':
      return Array.from(basicPromptLexer).map((token) => (
        <span title={JSON.stringify(token)}>{token.type} </span>
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
    if (!parser.results || !parser.results.length) {
      return <div>Failed to parse...</div>;
    }
    const [results]: Array<Array<Chunk>> = parser.results; // Strip outer Array

    return (
      <div className="whitespace-pre-line">
        {results.map((chunk, idx) => (
          <ChunkView
            chunk={chunk}
            key={`${idx}-chunk-${JSON.stringify(chunk)}`}
          />
        ))}
      </div>
    );
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      return <div>Unknown Error: {`${error}`}</div>;
    }
    return (
      <div>
        <h1>Failed to parse</h1>
        <div className="errorMessage whitespace-pre-line break-words overflow-x-auto font-mono">{`${error}`}</div>
      </div>
    );
  }
}
