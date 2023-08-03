import { AppBar, CssBaseline, Paper, Toolbar, Typography } from '@mui/material';
import { Editor } from './components/Editor';
import { useEffect, useRef, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { conf, language } from './common/sdprompt_monaco';
import monaco from 'monaco-editor';
import { Fill, LeftResizable, Top, ViewPort } from 'react-spaces';

function App() {
  const [promptText, setPromptText] = useState(
    localStorage.getItem('pc.active_prompt') ?? '',
  );
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
                color="initial">
                Prompt Crafter
              </Typography>
              <Typography
                className="flex-auto text-right select-none"
                variant="body1"
                color="initial">
                v0.0.1
              </Typography>
            </Toolbar>
          </AppBar>
        </Top>
        <Fill className="p-4">
          <LeftResizable size="50%">
            <Editor
              onMount={handleEditorDidMount}
              defaultValue={promptText}
              onChange={handleEditorTextChange}
            />
          </LeftResizable>
          <Fill>
            <div className="overflow-y-auto h-full whitespace-pre-wrap p-4">
              {splitOnCommas(promptText).map((segment, idx) => (
                <div key={`segment-${idx}`}>{segment}</div>
              ))}
            </div>
          </Fill>
        </Fill>
      </ViewPort>
    </>
  );
}

export default App;
