import { Grammar, Parser } from 'nearley';
import grammar from '../parsing/sdprompt';
import { basicPromptLexer } from '../parsing/sdprompt_lexer';
import { RenderType } from './RenderType';
import { Chunk } from './parsed_types';
import { ChunkView } from './Renderers';
import { Tooltip } from '@mui/material';

export function tokensView(prompt: string, renderType: RenderType) {
  switch (renderType) {
    case 'raw':
      return rawView(prompt);
    case 'tokens':
      return tokenView(prompt);
    case 'parsed':
      return parseView(prompt);
    case 'parsed-formatted':
      return formattedParseView(prompt);
  }
}

function rawView(prompt: string) {
  basicPromptLexer.reset(prompt);
  return (
    <div className="whitespace-pre-wrap">
      {Array.from(basicPromptLexer).map((token, idx) => (
        <span key={`${idx}-${token}`}>{token.value}</span>
      ))}
    </div>
  );
}

function tokenView(prompt: string) {
  basicPromptLexer.reset(prompt);
  return (
    <div className="whitespace-pre-wrap">
      {Array.from(basicPromptLexer).map((token, idx) => (
        <Tooltip
          title={JSON.stringify(token, null, 1)}
          sx={{ '& .MuiTooltip-popper': { whiteSpace: 'pre-wrap' } }}>
          <span key={`${idx}-${token}`}>{token.type} </span>
        </Tooltip>
      ))}
    </div>
  );
}

function parseView(prompt: string) {
  const parser = new Parser(Grammar.fromCompiled(grammar));
  try {
    parser.feed(prompt);
    return (
      <div className="whitespace-pre-wrap">
        {JSON.stringify(parser.results, null, 2)}
      </div>
    );
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
      <div className="whitespace-nowrap justify-start items-center flex-wrap flex gap-1">
        {results.map((chunk, idx) => (
          <ChunkView
            chunk={chunk}
            path={[0, idx]}
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
