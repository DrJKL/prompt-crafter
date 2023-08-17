import { CssBaseline, Typography, Snackbar, IconButton } from '@mui/material';
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
import { HistoryEdu, Close } from '@mui/icons-material';
import { PromptCrafterAppBar } from './components/PromptCrafterAppBar';
import { nextType } from './common/rendering/RenderType';
import { tokensView } from './common/rendering/PromptRender';
import { useImmer } from 'use-immer';
import {
  activePrompt$,
  getActivePromptLocal,
  getRenderingOptions,
  getSavedPromptsLocal,
  saveActivePrompt,
  savePrompt,
  saveRenderingOptions,
  savedPrompts$,
} from './common/saving/localstorage';
import { SavedPromptDisplay } from './components/SavedPrompt';
import { SizeUnit } from 'react-spaces/dist/core-types';

const minHeight =
  3 * parseInt(getComputedStyle(document.documentElement)?.fontSize);

function App() {
  const [promptText, setPromptText] = useState<string>(getActivePromptLocal());
  const [savedPrompts, setSavedPrompts] = useState(getSavedPromptsLocal());
  const [renderingOptions, setRenderingOptions] = useImmer(
    getRenderingOptions(),
  );
  const [showCopySnackbar, setShowCopySnackbar] = useState(false);
  const [savedPromptSectionHeight, setSavedPromptSectionHeight] =
    useState<SizeUnit>(minHeight);

  const monaco = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const renderedViewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sub = activePrompt$.subscribe((prompt) => setPromptText(prompt));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = savedPrompts$.subscribe((prompts) => setSavedPrompts(prompts));
    return () => sub.unsubscribe();
  }, []);

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
    if (value !== undefined) {
      setPromptText(value);
    }
  }

  function rotateSelect() {
    setRenderingOptions((draft) => {
      draft.renderType = nextType(draft.renderType);
    });
  }

  function copyRenderedText() {
    if (!renderedViewRef.current) {
      return;
    }
    const contents = renderedViewRef.current?.textContent;
    if (!contents) {
      return;
    }
    try {
      navigator.clipboard.writeText(contents);
      setShowCopySnackbar(true);
    } catch (_error: unknown) {
      //
    }
  }
  function resizeSavedPrompts() {
    if (
      !savedPromptSectionHeight ||
      typeof savedPromptSectionHeight !== 'number'
    ) {
      return;
    }
    if (savedPromptSectionHeight > minHeight) {
      setSavedPromptSectionHeight(minHeight);
    } else {
      setSavedPromptSectionHeight(10 * minHeight);
    }
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
            copyText={copyRenderedText}
          />
        </Top>
        <Fill className="p-4 pb-10">
          <LeftResizable size="50%">
            <Editor
              onMount={handleEditorDidMount}
              value={promptText}
              onChange={handleEditorTextChange}
              handleSave={savePrompt}
            />
          </LeftResizable>
          <Fill>
            <Fill>
              <div
                className="overflow-y-auto h-full p-4 pl-6"
                ref={renderedViewRef}>
                {tokensView(promptText, renderingOptions)}
              </div>
            </Fill>
            <BottomResizable
              size={savedPromptSectionHeight}
              trackSize
              onResizeEnd={(newSize) => setSavedPromptSectionHeight(newSize)}
              minimumSize={minHeight}
              className="bg-gradient-to-tr from-stone-500 to-blue-800 p-2 text-xl font-mono opacity-70">
              <Typography
                variant="h6"
                component="h2"
                className="select-none cursor-default"
                onDoubleClick={() => resizeSavedPrompts()}>
                Saved Prompts
              </Typography>
              <div>
                {savedPrompts.map((prompt, idx) => (
                  <SavedPromptDisplay key={idx} prompt={prompt} />
                ))}
              </div>
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
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showCopySnackbar}
        onClose={() => setShowCopySnackbar(false)}
        message="Prompt Copied to Clipboard!"
        autoHideDuration={1000}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setShowCopySnackbar(false)}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
}

export default App;
