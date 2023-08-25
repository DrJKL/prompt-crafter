import { RenderingOptions } from './RenderType';
import { PromptView } from './PromptView';
import { Tooltip } from '@mui/material';
import { Token } from 'moo';
import { ParseResult } from './parsed_types';

export type SelectionUpdateFn = (path: number[], selection: number[]) => void;

export interface RenderedPromptProps {
  tokens: Token[];
  parsedResults: ParseResult;
  options: RenderingOptions;
  updateSelection: SelectionUpdateFn;
}

export function RenderedPrompt({
  tokens,
  parsedResults,
  options,
  updateSelection,
}: RenderedPromptProps) {
  const { renderType, fancy, dense } = options;
  switch (renderType) {
    case 'raw':
      return rawView(tokens);
    case 'tokens':
      return tokenView(tokens);
    case 'parsed':
      return parseView(parsedResults);
    case 'parsed-formatted':
      return formattedParseView(parsedResults, updateSelection, fancy, dense);
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
    return allResults.map(([parseResult], idx) => (
      <div key={idx} className="contents">
        <hr />
        <div className="whitespace-pre-wrap">
          {JSON.stringify(parseResult, null, 2)}
        </div>
      </div>
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
  updateSelection: SelectionUpdateFn,
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
            className={`${
              dense
                ? 'flex-wrap flex gap-[4px_2px] items-end whitespace-normal'
                : `whitespace-pre-line`
            }`}>
            {ambiguousParse && <div>{idx}</div>}
            <PromptView
              prompt={results}
              path={[idx]}
              fancy={fancy}
              dense={dense}
              updateSelection={updateSelection}
              key={idx}
            />
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
