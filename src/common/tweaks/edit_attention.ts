import type monaco from 'monaco-editor';
import { Selection, SelectionDirection } from 'monaco-editor';

const delimiters = ' .,\\/!?%^*;:{}=-_`~()\r\n\t';
const delta = parseFloat('0.05');

function incrementWeight(weight: string, delta: number): string {
  const floatWeight = parseFloat(weight);
  if (isNaN(floatWeight)) return weight;
  const newWeight = floatWeight + delta;
  if (newWeight < 0) return '0';
  return String(Number(newWeight.toFixed(10)));
}

// Select the current word, find the start and end of the word
function findNearestEnclosure(
  text: string,
  cursorPos: number,
): { start: number; end: number } | false {
  let start = cursorPos;
  let end = cursorPos;
  let openCount = 0;
  let closeCount = 0;

  // Find opening parenthesis before cursor
  while (--start >= 0) {
    // start--;
    if (text[start] === '(' && openCount === closeCount) break;
    if (text[start] === '(') openCount++;
    if (text[start] === ')') closeCount++;
  }
  if (start < 0) return false;

  openCount = 0;
  closeCount = 0;

  // Find closing parenthesis after cursor
  while (end < text.length) {
    if (text[end] === ')' && openCount === closeCount) break;
    if (text[end] === '(') openCount++;
    if (text[end] === ')') closeCount++;
    end++;
  }
  if (end === text.length) return false;

  return { start: start + 1, end: end };
}

function addWeightToParentheses(text: string): string {
  const parenRegex = /^\((.*)\)$/;
  const parenMatch = text.match(parenRegex);

  const floatRegex = /:([+-]?(\d*\.)?\d+([eE][+-]?\d+)?)/;
  const floatMatch = text.match(floatRegex);

  if (parenMatch && !floatMatch) {
    return `(${parenMatch[1]}:1.0)`;
  }
  return text;
}

function getRange(
  inputText: string,
  start: number,
  end: number,
): [number, number] | undefined {
  // If there is no selection, attempt to find the nearest enclosure, or select the current word
  if (start >= end) {
    const nearestEnclosure = findNearestEnclosure(inputText, start);
    if (nearestEnclosure) {
      start = nearestEnclosure.start;
      end = nearestEnclosure.end;
    } else {
      while (!delimiters.includes(inputText[start - 1]) && start > 0) {
        start--;
      }

      while (!delimiters.includes(inputText[end]) && end < inputText.length) {
        end++;
      }

      if (start >= end) return;
    }
  }

  // If the selection ends with a space, remove it
  if (inputText[end - 1] === ' ') {
    end -= 1;
  }

  // If there are parentheses left and right of the selection, select them
  if (inputText[start - 1] === '(' && inputText[end] === ')') {
    start -= 1;
    end += 1;
  }
  return [start, end];
}

function findRelevantSelection(
  editor: monaco.editor.IStandaloneCodeEditor,
  originalSelection: Selection,
): Selection | undefined {
  const startPosition = originalSelection.getStartPosition();
  const endPosition = originalSelection.getEndPosition();
  const model = editor.getModel();
  if (!model) {
    return originalSelection;
  }
  const startX = model.getOffsetAt(startPosition);
  const endX = model.getOffsetAt(endPosition);
  const range = getRange(editor.getValue(), startX, endX);
  if (!range) {
    return;
  }
  const [start, end] = range;
  return Selection.fromPositions(
    model.getPositionAt(start),
    model.getPositionAt(end),
  );
}

function getUpdatedText(
  inputText: string,
  startX: number,
  endX: number,
  weightDelta: number,
): { start: number; end: number; updatedText: string } | undefined {
  const range = getRange(inputText, startX, endX);
  if (!range) {
    return;
  }
  const [start, end] = range;
  let selectedText = inputText.substring(start, end);

  // If the selection is not enclosed in parentheses, add them
  if (!selectedText.startsWith('(') || !selectedText.endsWith(')')) {
    selectedText = `(${selectedText})`;
  }

  // If the selection does not have a weight, add a weight of 1.0
  selectedText = addWeightToParentheses(selectedText);

  // Increment the weight
  const updatedText = selectedText.replace(
    /\((.*):(\d+(?:\.\d+)?)\)/,
    (_match, text, weight) => {
      weight = incrementWeight(weight, weightDelta);
      if (weight == 1) {
        return text;
      }
      return `(${text}:${weight})`;
    },
  );

  return { start, end, updatedText };
}

export function editAttentionMonaco(
  editor: monaco.editor.IStandaloneCodeEditor,
  upOrDown: 'up' | 'down',
) {
  const selection = editor.getSelection();
  if (!selection) {
    return;
  }
  const newSelection = findRelevantSelection(editor, selection);
  if (!newSelection) {
    return;
  }
  const text = editor.getValue();
  const model = editor.getModel();
  if (!model) {
    return;
  }
  const updated = getUpdatedText(
    text,
    model.getOffsetAt(newSelection.getStartPosition()),
    model.getOffsetAt(newSelection.getEndPosition()),
    upOrDown === 'up' ? delta : -delta,
  );
  if (!updated) {
    return;
  }
  const edit: monaco.editor.ISingleEditOperation = {
    range: newSelection,
    text: updated.updatedText,
  };
  editor.executeEdits(null, [edit], (edits) =>
    edits.map((edit) =>
      Selection.fromRange(edit.range, SelectionDirection.LTR),
    ),
  );
}
