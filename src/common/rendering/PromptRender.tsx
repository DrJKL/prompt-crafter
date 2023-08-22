import { RenderingOptions } from './RenderType';
import { ChunkView } from './Renderers';
import { Tooltip } from '@mui/material';
import { ParseResult } from '../parsing/app_parsing';
import { Token } from 'moo';

export function tokensView(
  tokens: Token[],
  parsedResults: ParseResult,
  options: RenderingOptions,
) {
  const { renderType, fancy, dense } = options;
  switch (renderType) {
    case 'raw':
      return rawView(tokens);
    case 'tokens':
      return tokenView(tokens);
    case 'parsed':
      return parseView(parsedResults);
    case 'parsed-formatted':
      return formattedParseView(parsedResults, fancy, dense);
  }
}

function rawView(tokens: Token[]) {
  try {
    return (
      <div className="whitespace-pre-wrap">
        {tokens.map((token, idx) => (
          <span key={`${idx}-${token}`}>{token.value}</span>
        ))}
      </div>
    );
  } catch (err: unknown) {
    if (err instanceof Error) return <pre>{err.message}</pre>;
    return <pre>{`${err}`}</pre>;
  }
}

function tokenView(tokens: Token[]) {
  try {
    return (
      <div className="whitespace-pre-wrap">
        {tokens.map((token, idx) => (
          <Tooltip
            key={idx}
            title={JSON.stringify(token, null, 1)}
            sx={{ '& .MuiTooltip-popper': { whiteSpace: 'pre-wrap' } }}>
            <span key={`${idx}-${token}`}>{token.type} </span>
          </Tooltip>
        ))}
      </div>
    );
  } catch (err: unknown) {
    if (err instanceof Error) return <pre>{err.message}</pre>;
    return <pre>{`${err}`}</pre>;
  }
}

function parseView(allResults: ParseResult) {
  try {
    return allResults.map(([parseResult]) => (
      <>
        <hr />
        <div className="whitespace-pre-wrap">
          {JSON.stringify(parseResult, null, 2)}
        </div>
      </>
    ));
  } catch (error: unknown) {
    return (
      <div>
        <h1>Failed to parse</h1>
        <div>{`${error}`}</div>
      </div>
    );
  }
}

function formattedParseView(
  allResults: ParseResult,
  fancy = true,
  dense = true,
) {
  try {
    if (!allResults || !allResults.length) {
      return (
        <>
          <div>Failed to parse...</div>
        </>
      );
    }
    const ambiguousParse = allResults.length > 1;
    return (
      <>
        {allResults.map(([results], idx) => (
          <div
            key={`parse-result-${idx}`}
            className={dense ? 'whitespace-normal' : `whitespace-pre-line`}>
            {ambiguousParse && <div>{idx}</div>}
            {results.map((chunk, idx) => (
              <ChunkView
                chunk={chunk}
                path={[0, idx]}
                fancy={fancy}
                key={`${idx}-chunk-${JSON.stringify(chunk)}`}
              />
            ))}
          </div>
        ))}
      </>
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
