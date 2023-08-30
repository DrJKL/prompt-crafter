import { useMonaco } from '@monaco-editor/react';
import { Close, HistoryEdu } from '@mui/icons-material';
import {
  AppBar,
  CssBaseline,
  Drawer,
  IconButton,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import monaco, { KeyCode, KeyMod } from 'monaco-editor';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bottom,
  BottomResizable,
  Fill,
  LeftResizable,
  Top,
} from 'react-spaces';
import { SizeUnit } from 'react-spaces/dist/core-types';
import seedrandom from 'seedrandom';
import { useImmer, useImmerReducer } from 'use-immer';
import { getPromptTokens, parsePrompt } from './common/parsing/app_parsing';
import {
  ModifyPromptAction,
  fillOutWildcards,
  variantSelectionReducer,
} from './common/prompt_modification';
import { nextType } from './common/rendering/RenderType';
import { RenderedPrompt } from './common/rendering/RenderedPrompt';
import { ParseResult } from './common/rendering/parsed_types';
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
import { conf, language } from './common/sdprompt_monaco';
import { editAttentionMonaco } from './common/tweaks/edit_attention';
import { Editor } from './components/Editor';
import { PromptCrafterAppBar } from './components/PromptCrafterAppBar';
import { SavedPromptDisplay } from './components/SavedPrompt';
import { FolderTreeDisplay } from '@wildcard-browser/src/components/FolderTree';
import { WildcardFile } from '@wildcard-browser/src/lib/wildcards';

const minHeight =
  3 * parseInt(getComputedStyle(document.documentElement)?.fontSize);

function App() {
  const [promptText, setPromptText] = useState<string>(getActivePromptLocal());
  const [_timesRandomized, setTimesRandomized] = useState(0);
  const [seed, setSeed] = useState('so random.');
  const prng = useMemo(() => seedrandom.alea(seed), [seed]);

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

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const results = parsePrompt(promptText);
      dispatch({ type: 'reset', results });

      fillOutWildcards(results).then((filledOut) => {
        dispatch({ type: 'reset', results: filledOut });
      });
    } catch (err: unknown) {
      console.error(err);
    }
  }, [promptText, dispatch]);

  function updateSelection(path: number[], selection: number[]) {
    dispatch({ type: 'choose-variant', path, selection });
  }

  function randomizePrompt() {
    dispatch({ type: 'randomize', prng });
    setTimesRandomized((prev) => prev + 1);
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

  async function copyToClipboard(text: string) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    }
  }

  const drawerWidth = 400;
  const toggleTree = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <CssBaseline />
      <AppBar
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        position="relative">
        <Toolbar className="flex flex-auto justify-between">
          <PromptCrafterAppBar
            renderingOptions={renderingOptions}
            setRenderingOptions={setRenderingOptions}
            rotateSelect={rotateSelect}
            copyText={copyRenderedText}
            randomizePrompt={randomizePrompt}
            seed={seed}
            setSeed={setSeed}
            toggleWildcardTree={toggleTree}
          />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,

          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        anchor="left"
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}>
        <Toolbar />
        <FolderTreeDisplay
          onLeafClick={(_entry: WildcardFile) => {
            // setSearch(entry.filepath);
            // Maybe a dialog with the entries?
            // Or copy the wildcard?
            // I think Copy the wildcard by default, maybe an icon for the dialog
            copyToClipboard(_entry.toPlaceholder());
            setDrawerOpen(false);
          }}
        />
      </Drawer>
      <Fill>
        <Top size={64}>
          <Toolbar />
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
                className="overflow-y-auto p-4 pl-6 overflow-x-hidden max-h-full h-fit"
                ref={renderedViewRef}>
                <div>
                  <RenderedPrompt
                    options={renderingOptions}
                    tokens={promptTokens}
                    parsedResults={workingPrompt}
                    updateSelection={updateSelection}
                  />
                </div>
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
                onClick={() => resizeSavedPrompts()}>
                Saved Prompts
              </Typography>
              <div className="overflow-y-auto flex-grow-0">
                {savedPrompts.map((prompt, idx) => (
                  <SavedPromptDisplay
                    key={idx}
                    prompt={prompt}
                    setPromptText={setPromptText}
                  />
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
      </Fill>
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
