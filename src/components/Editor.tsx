import MonacoEditor, { EditorProps } from '@monaco-editor/react';
import _ from 'lodash';

const DEFAULT_OPTIONS: EditorProps = {
  theme: 'vs-dark',
  options: {
    padding: { top: 16 },
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'wordWrapColumn',
  },
  language: 'sdprompt',
};

export function Editor(props: EditorProps = {}) {
  const withDefaults = _.merge({}, DEFAULT_OPTIONS, props);
  return (
    <>
      <MonacoEditor {...withDefaults}></MonacoEditor>
    </>
  );
}
