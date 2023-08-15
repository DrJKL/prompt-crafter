import { CssBaseline, Typography } from '@mui/material';
import { Editor } from './components/Editor';
import { useEffect, useRef, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { conf, language } from './common/sdprompt_monaco';
import monaco from 'monaco-editor';
import {
  Bottom,
  BottomResizable,
  Fill,
  LeftResizable,
  Top,
  ViewPort,
} from 'react-spaces';
import { HistoryEdu } from '@mui/icons-material';
import { PromptCrafterAppBar } from './components/PromptCrafterAppBar';
import { nextType } from './common/rendering/RenderType';
import { tokensView } from './common/rendering/PromptRender';
import { useImmer } from 'use-immer';
import {
  getActivePrompt,
  getRenderingOptions,
  saveActivePrompt,
  saveRenderingOptions,
} from './common/saving/localstorage';

/** LocalStorage keys */

function App() {
  const [promptText, setPromptText] = useState(getActivePrompt());
  const [renderingOptions, setRenderingOptions] = useImmer(
    getRenderingOptions(),
  );

  const monaco = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    saveActivePrompt(promptText);
  }, [promptText]);

  useEffect(() => {
    saveRenderingOptions(renderingOptions);
  }, [renderingOptions]);

  useEffect(() => {
    if (!monaco) {
      return;
    }
    monaco.languages.register({ id: 'sdprompt' });
    monaco.languages.setLanguageConfiguration('sdprompt', conf);
    monaco.languages.setMonarchTokensProvider('sdprompt', language);
  }, [monaco]);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  function handleEditorTextChange(value: string | undefined) {
    if (value) {
      setPromptText(value);
    }
  }

  function rotateSelect() {
    setRenderingOptions((draft) => {
      draft.renderType = nextType(draft.renderType);
    });
  }

  return (
    <>
      <CssBaseline />
      <ViewPort>
        <Top size={64}>
          <PromptCrafterAppBar
            renderingOptions={renderingOptions}
            setRenderingOptions={setRenderingOptions}
            rotateSelect={rotateSelect}
          />
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
              <div className="overflow-y-auto h-full p-4 pl-6">
                {tokensView(promptText, renderingOptions)}
              </div>
            </Fill>
            <BottomResizable
              size="10px"
              minimumSize={10}
              className="bg-gradient-to-tr from-stone-500 to-blue-800 p-2 text-xl font-mono opacity-70">
              <Typography variant="h6" component="h2" className="pl-6">
                Saved
              </Typography>
            </BottomResizable>
          </Fill>
        </Fill>
        <Bottom size={'2rem'} className="flex justify-center gap-2">
          <HistoryEdu color="secondary" />
          <span>
            Made with love by{' '}
            <a target="_blank" href="https://github.com/drjkl/prompt-crafter">
              DrJKL
            </a>
          </span>
          <HistoryEdu color="secondary" />
        </Bottom>
      </ViewPort>
    </>
  );
}

export default App;
