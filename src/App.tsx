import {
  CssBaseline,
  Typography,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Editor } from './components/Editor';
import { useEffect, useRef, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { conf, language } from './common/sdprompt_monaco';
import monaco, { KeyCode, KeyMod } from 'monaco-editor';
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
import { RenderedPrompt } from './common/rendering/PromptRender';
import { useImmer, useImmerReducer } from 'use-immer';
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
import { editAttentionMonaco } from './common/tweaks/edit_attention';
import { getPromptTokens, parsePrompt } from './common/parsing/app_parsing';
import { current } from 'immer';
import { ParseResult, Prompt } from './common/rendering/parsed_types';
import { randomizeAllResults } from './common/random/randomize';

const minHeight =
  3 * parseInt(getComputedStyle(document.documentElement)?.fontSize);

type ModifyPromptAction =
  | { type: 'reset'; results: ParseResult }
  | { type: 'randomize' }
  | { type: 'choose-variant'; path: number[]; selection: number[] };

function variantSelectionReducer(
  draft: ParseResult,
  action: ModifyPromptAction,
) {
  switch (action.type) {
    case 'reset':
      return action.results;
    case 'choose-variant':
      return modifySelection(draft, action.path, action.selection);
    case 'randomize':
      randomizeAllResults(draft);
      return;
  }
  action satisfies never;
  return draft;
}

function modifySelection(
  draft: ParseResult,
  path: number[],
  selection: number[],
) {
  const undraft = current(draft);
  const firstParse = draft[0];
  if (!firstParse) {
    console.error(`Can't modify selection, bad Chunks provided: ${undraft}`);
    return draft;
  }
  let chunkCursor: Prompt[] = firstParse;
  for (let i = 0; i < path.length - 2; i += 2) {
    if (path[i] < 0 || path[i + 1] < 0) {
      return;
    }
    const chunk = chunkCursor[path[i]];
    const nextVariants = chunk[path[i + 1]];
    if (nextVariants?.type !== 'variants') {
      console.error(`Found non-variable sub-path when trying to update
      ${chunk} in
      ${draft} with path
      ${path}`);

      return draft;
    }
    chunkCursor = [...nextVariants.variants];
  }
  try {
    const leafHopefully =
      chunkCursor[path[path.length - 2]][path[path.length - 1]];
    if (leafHopefully?.type === 'variants') {
      leafHopefully.selections = selection;
      return;
    }
    console.error(
      'Something has gone horribly awry',
      JSON.parse(JSON.stringify(leafHopefully)),
    );
  } catch (err: unknown) {
    console.error(err);
  }
}

function App() {
  const [promptText, setPromptText] = useState<string>(getActivePromptLocal());

  const [savedPrompts, setSavedPrompts] = useState(getSavedPromptsLocal());
  const [renderingOptions, setRenderingOptions] = useImmer(
    getRenderingOptions(),
  );

  const [showCopySnackbar, setShowCopySnackbar] = useState(false);
  const [savedPromptSectionHeight, setSavedPromptSectionHeight] =
    useState<SizeUnit>(minHeight);

  const [editorKey, setEditorKey] = useState(1);

  const monaco = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const renderedViewRef = useRef<HTMLDivElement | null>(null);

  const promptTokens = getPromptTokens(promptText);

  const [workingPrompt, dispatch] = useImmerReducer<
    ParseResult,
    ModifyPromptAction
  >(variantSelectionReducer, []);

  useEffect(() => {
    try {
      const results = parsePrompt(promptText);
      dispatch({ type: 'reset', results });
    } catch (err: unknown) {
      console.error(err);
    }
  }, [promptText, dispatch]);

  function updateSelection(path: number[], selection: number[]) {
    dispatch({ type: 'choose-variant', path, selection });
  }

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

  function incrementEditorKey() {
    setEditorKey(editorKey + 1);
  }

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.UpArrow, () => {
      editAttentionMonaco(editor, 'up');
    });
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.DownArrow, () => {
      editAttentionMonaco(editor, 'down');
    });
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

  function randomizePrompt() {
    dispatch({ type: 'randomize' });
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
            randomizePrompt={randomizePrompt}
          />
        </Top>
        <Fill className="p-4 pb-10">
          <LeftResizable size="50%">
            <Editor
              key={editorKey}
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
                <RenderedPrompt
                  options={renderingOptions}
                  tokens={promptTokens}
                  parsedResults={workingPrompt}
                  updateSelection={updateSelection}
                />
              </div>
            </Fill>
            <BottomResizable
              size={savedPromptSectionHeight}
              trackSize
              onResizeEnd={(newSize) => setSavedPromptSectionHeight(newSize)}
              minimumSize={minHeight}
              className="bg-gradient-to-tr from-stone-500 to-blue-800 p-2 text-xl font-mono opacity-70 flex flex-col">
              <Typography
                variant="h6"
                component="h2"
                className="select-none cursor-pointer flex-shrink"
                onDoubleClick={() => resizeSavedPrompts()}>
                Saved Prompts
              </Typography>
              <div className="overflow-y-auto flex-grow-0">
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
            <Tooltip
              title="Who likes to flaunt color and theming principles"
              enterDelay={2000}>
              <a target="_blank" href="https://github.com/drjkl/prompt-crafter">
                DrJKL
              </a>
            </Tooltip>
          </span>
          {/* Here to force-remount the editor. */}
          <HistoryEdu color="secondary" onClick={incrementEditorKey} />
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
