import MonacoEditor, { EditorProps } from '@monaco-editor/react';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import { Autocomplete, Toolbar, Button } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { SavedPrompt } from '../common/saving/types';
import {
  activePromptName$,
  getActivePromptNameLocal,
  saveActivePromptName,
} from '../common/saving/localstorage';

interface AdditionalEditorProps {
  handleSave: (promptDetails: SavedPrompt) => void;
}

const DEFAULT_OPTIONS: EditorProps = {
  theme: 'vs-dark',
  options: {
    padding: { top: 16 },
    minimap: { enabled: false },
    automaticLayout: true,
    // scrollBeyondLastLine: false,
    wordWrap: 'on',
  },
  language: 'sdprompt',
};

export function Editor(props: EditorProps & AdditionalEditorProps) {
  const withDefaults = _.merge({}, DEFAULT_OPTIONS, props);
  const { handleSave } = withDefaults;
  const [promptName, setPromptName] = useState(getActivePromptNameLocal());
  const [promptTags, setPromptTags] = useState<string[]>([]);
  const promptDetails: SavedPrompt = {
    name: promptName,
    tags: promptTags,
    contents: withDefaults.value ?? '',
  };

  useEffect(() => {
    const sub = activePromptName$.subscribe((name) => setPromptName(name));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    saveActivePromptName(promptName);
  }, [promptName]);

  return (
    <>
      <Toolbar className="p-1.5 flex justify-between gap-1.5">
        <TextField
          id="prompt-name-input"
          label="Prompt Name"
          value={promptName}
          onChange={(event) => setPromptName(event.target.value)}
          size="small"
          className="flex-1"
        />
        <Autocomplete
          className="flex-1"
          multiple
          limitTags={2}
          freeSolo
          options={[]}
          value={promptTags}
          onChange={(_, value) => {
            setPromptTags(value);
          }}
          size="small"
          renderInput={(params) => <TextField {...params} label="Tags" />}
        />
        <Button
          className="flex-shrink"
          variant="text"
          color="secondary"
          endIcon={<Save />}
          onClick={() => handleSave(promptDetails)}>
          Save
        </Button>
      </Toolbar>
      <MonacoEditor {...withDefaults}></MonacoEditor>
    </>
  );
}
