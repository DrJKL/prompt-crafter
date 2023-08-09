import {
  AppBar,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Editor } from './components/Editor';
import { useEffect, useRef, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { conf, language } from './common/sdprompt_monaco';
import monaco from 'monaco-editor';
import {
  Bottom,
  BottomResizable,
  CenterType,
  Fill,
  LeftResizable,
  Top,
  ViewPort,
} from 'react-spaces';
import { HistoryEdu, NavigateNext } from '@mui/icons-material';
import { basicPromptLexer } from './common/sdprompt_lexer';
import grammar from './common/sdprompt';
import { Grammar, Parser } from 'nearley';

/** LocalStorage keys */
const keyActivePrompt = 'pc.active_prompt';
const keyRenderType = 'pc.prompt_render_type';

const RENDER_TYPES = ['raw', 'tokens', 'parsed'] as const;
type RenderType = (typeof RENDER_TYPES)[number];

function getRenderTypeFromLocalStorage(): RenderType {
  const currentValue = localStorage.getItem(keyRenderType);
  if (isRenderType(currentValue)) {
    return currentValue;
  }
  return 'raw';
}

function isRenderType(typeMaybe: unknown): typeMaybe is RenderType {
  return (
    typeof typeMaybe === 'string' &&
    RENDER_TYPES.some((type) => type === typeMaybe)
  );
}

function App() {
  const [promptText, setPromptText] = useState(
    localStorage.getItem(keyActivePrompt) ?? '',
  );

  useEffect(() => {
    localStorage.setItem(keyActivePrompt, promptText);
  }, [promptText]);

  const [typeOrValue, setTypeOrValue] = useState<RenderType>(
    getRenderTypeFromLocalStorage(),
  );

  useEffect(() => {
    localStorage.setItem(keyRenderType, typeOrValue);
  }, [typeOrValue]);

  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) {
      return;
    }
    monaco.languages.register({ id: 'sdprompt' });
    monaco.languages.setLanguageConfiguration('sdprompt', conf);
    monaco.languages.setMonarchTokensProvider('sdprompt', language);
  }, [monaco]);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  function handleEditorTextChange(value: string | undefined) {
    if (value) {
      setPromptText(value);
    }
  }

  function handleDisplayTypeChange(event: SelectChangeEvent<RenderType>) {
    const value: unknown = event.target.value;
    if (isRenderType(value)) {
      setTypeOrValue(value);
    }
  }

  function rotateSelect() {
    const currentRender = RENDER_TYPES.indexOf(typeOrValue);
    setTypeOrValue(RENDER_TYPES[(currentRender + 1) % RENDER_TYPES.length]);
  }

  function tokensView(prompt: string) {
    basicPromptLexer.reset(prompt);
    switch (typeOrValue) {
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

  return (
    <>
      <CssBaseline />
      <ViewPort>
        <Top size={64}>
          <AppBar position="static">
            <Toolbar className="flex flex-auto justify-between">
              <Typography
                className="flex-auto select-none"
                variant="h5"
                component="h1">
                Prompt Crafter
              </Typography>
              <span>
                <Select
                  name="display-type"
                  value={typeOrValue}
                  onChange={handleDisplayTypeChange}>
                  <MenuItem value="raw">Raw</MenuItem>
                  <MenuItem value="tokens">Tokens</MenuItem>
                  <MenuItem value="parsed">Parsed</MenuItem>
                </Select>
                <IconButton aria-label="" onClick={rotateSelect}>
                  <NavigateNext />
                </IconButton>
              </span>
              <Typography
                className="flex-auto text-right select-none"
                variant="subtitle1">
                v0.0.2
              </Typography>
            </Toolbar>
          </AppBar>
        </Top>
        <Fill className="p-4 pb-10">
          <LeftResizable size="50%">
            <Editor
              onMount={handleEditorDidMount}
              defaultValue={promptText}
              onChange={handleEditorTextChange}
            />
          </LeftResizable>
          <Fill>
            <Fill>
              <div className="overflow-y-auto h-full whitespace-pre-wrap p-4 pl-6">
                {tokensView(promptText)}
              </div>
            </Fill>
            <BottomResizable
              size="10px"
              minimumSize={10}
              className="bg-blue-600 p-2 text-xl font-mono">
              <Typography variant="h6" component="h2" className="pl-6">
                Saved
              </Typography>
            </BottomResizable>
          </Fill>
        </Fill>
        <Bottom size={'2rem'} centerContent={CenterType.HorizontalVertical}>
          <HistoryEdu color="secondary" />
        </Bottom>
      </ViewPort>
    </>
  );
}

export default App;
