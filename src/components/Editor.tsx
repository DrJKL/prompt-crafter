import MonacoEditor from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export interface EditorProps {}

export function Editor(_props: EditorProps = {}) {
  function handleEditorChange(
    value: string | undefined,
    _event: monaco.editor.IModelContentChangedEvent,
  ) {
    console.log(value);
  }
  return (
    <>
      <MonacoEditor
        theme="vs-dark"
        onChange={handleEditorChange}
        language="yaml"></MonacoEditor>
    </>
  );
}
