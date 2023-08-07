import { AppBar, CssBaseline, Toolbar, Typography } from '@mui/material';
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
import { basicPromptLexer } from './common/sdprompt_lexer';

function App() {
  const [promptText, setPromptText] = useState(
    localStorage.getItem('pc.active_prompt') ?? '',
  );
  const [typeOrValue, setTypeOrValue] = useState(false);
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
  function splitOnCommas(prompt: string) {
    return prompt.split(/\s*,\s*/).map((s) => s.trim());
  }
  function tokensView(prompt: string) {
    basicPromptLexer.reset(prompt);
    return Array.from(basicPromptLexer).map((token) => (
      <span>{typeOrValue ? `${token.type} ` : token.value}</span>
    ));
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
                <input
                  type="checkbox"
                  name=""
                  id=""
                  checked={typeOrValue}
                  onChange={(event) => setTypeOrValue(event.target.checked)}
                />
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
                {/*
                  splitOnCommas(promptText).map((segment, idx) => (
                    <div key={`segment-${idx}`}>{segment}</div>
                  ))
                  //*/}
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
