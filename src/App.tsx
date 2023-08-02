import { AppBar, CssBaseline, Toolbar, Typography } from '@mui/material';
import { Editor } from './components/Editor';
import { useEffect, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { conf, language } from './common/sdprompt_monaco';
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

  function handleEditorTextChange(value: string | undefined) {
    if (value) {
      setPromptText(value);
    }
  }
  function splitOnCommas(prompt: string) {
    return prompt.split(/\s*,\s*/).join('\n');
  }

  return (
    <>
      <CssBaseline />
      <div className="grid grid-cols-1 grid-rows-[auto_1fr]">
        <AppBar classes="grid">
          <Toolbar className="flex flex-auto justify-between">
            <Typography className="flex-auto" variant="h5" color="initial">
              Prompt Crafter
            </Typography>
            <Typography
              className="flex-auto text-right"
              variant="body1"
              color="initial">
              v0.0.1
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <main className="grid grid-cols-2 grid-rows-1 p-4">
          <Editor defaultValue={promptText} onChange={handleEditorTextChange} />
          <div className="whitespace-pre-wrap">{splitOnCommas(promptText)}</div>
        </main>
      </div>
    </>
  );
}

export default App;
