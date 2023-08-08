import {
  AppBar,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  SelectProps,
} from '@mui/material';
import { Editor } from './components/Editor';
import { useEffect, useRef, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { conf, language } from './common/sdprompt_monaco';
import monaco from 'monaco-editor';
import {
  BottomResizable,
  Fill,
  LeftResizable,
  Top,
  ViewPort,
} from 'react-spaces';
import { NavigateNext } from '@mui/icons-material';
import { basicPromptLexer } from './common/sdprompt_lexer';
import grammar from './common/sdprompt';
import { Grammar, Parser } from 'nearley';

const RENDER_TYPES = ['raw', 'tokens', 'parsed'] as const;
type RenderType = (typeof RENDER_TYPES)[number];

function App() {
  const [promptText, setPromptText] = useState(
    localStorage.getItem('pc.active_prompt') ?? '',
  );
  const [typeOrValue, setTypeOrValue] = useState<RenderType>('raw');
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) {
      return;
    }
    monaco.languages.register({ id: 'sdprompt' });
    monaco.languages.setLanguageConfiguration('sdprompt', conf);
    monaco.languages.setMonarchTokensProvider('sdprompt', language);
  }, [monaco]);

  useEffect(() => {
    localStorage.setItem('pc.active_prompt', promptText);
  }, [promptText]);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  function handleEditorTextChange(value: string | undefined) {
    if (value) {
      setPromptText(value);
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
    parser.feed(prompt);
    return JSON.stringify(parser.results, null, 2);
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
                  onChange={(event) => setTypeOrValue(event.target.value)}>
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
                v0.0.1
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
              size="0%"
              className="bg-blue-600 p-2 text-xl font-mono">
              <Typography variant="h6" component="h2" className="pl-6">
                Saved
              </Typography>
            </BottomResizable>
          </Fill>
        </Fill>
        {/* <Bottom size={'2rem'} centerContent={CenterType.HorizontalVertical}>
          Footer
        </Bottom> */}
      </ViewPort>
    </>
  );
}

export default App;
