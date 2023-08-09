import { CssBaseline, Typography, SelectChangeEvent } from '@mui/material';
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
import { HistoryEdu } from '@mui/icons-material';
import { PromptCrafterAppBar } from './components/PromptCrafterAppBar';
import {
  RenderType,
  isRenderType,
  nextType,
} from './common/rendering/RenderType';
import { tokensView } from './common/rendering/PromptRender';

/** LocalStorage keys */
const keyActivePrompt = 'pc.active_prompt';
const keyRenderType = 'pc.prompt_render_type';

function getRenderTypeFromLocalStorage(): RenderType {
  const currentValue = localStorage.getItem(keyRenderType);
  return isRenderType(currentValue) ? currentValue : 'raw';
}

function App() {
  const [promptText, setPromptText] = useState(
    localStorage.getItem(keyActivePrompt) ?? '',
  );
  const [renderType, setRenderType] = useState<RenderType>(
    getRenderTypeFromLocalStorage(),
  );
  const monaco = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    localStorage.setItem(keyActivePrompt, promptText);
  }, [promptText]);

  useEffect(() => {
    localStorage.setItem(keyRenderType, renderType);
  }, [renderType]);

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

  function handleDisplayTypeChange(event: SelectChangeEvent<RenderType>) {
    const value: unknown = event.target.value;
    if (isRenderType(value)) {
      setRenderType(value);
    }
  }

  function rotateSelect() {
    setRenderType(nextType(renderType));
  }

  return (
    <>
      <CssBaseline />
      <ViewPort>
        <Top size={64}>
          <PromptCrafterAppBar
            renderType={renderType}
            handleDisplayTypeChange={handleDisplayTypeChange}
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
              <div className="overflow-y-auto h-full whitespace-pre-wrap p-4 pl-6">
                {tokensView(promptText, renderType)}
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
