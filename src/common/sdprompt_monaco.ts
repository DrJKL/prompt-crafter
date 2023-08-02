import type { languages } from 'monaco-editor';

export const conf: languages.LanguageConfiguration = {
  brackets: [
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
    ['<', '>'],
  ],
  autoClosingPairs: [
    { open: '"', close: '"' },
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' },
    { open: '<', close: '>' },
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' },
    { open: '<', close: '>' },
  ],
};

export const language = <languages.IMonarchLanguage>{
  defaultToken: '',
  ignoreCase: true,
  tokenPostfix: '.sdprompt',

  brackets: [
    { token: 'delimiter.angle', open: '<', close: '>' },
    { token: 'delimiter.bracket', open: '{', close: '}' },
    { token: 'delimiter.parenthesis', open: '(', close: ')' },
    { token: 'delimiter.square', open: '[', close: ']' },
  ],

  keywords: ['lyco', 'lycoris', 'lora', 'embedding'],

  numberFloat: /\d*\.\d+([eE][-+]?\d+)?/,
  number: /\d+/,

  symbols: /[=!~?&|+\-*/^;.,]+/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // whitespace
      [/[ \t\r\n]+/, ''],

      // words
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@keywords': 'keyword',
          },
        },
      ],

      // punctuations
      [/[{}()[\]<>]/, '@brackets'],
      [/@symbols/, 'delimiter'],

      // numbers
      [/@numberFloat/, 'number.float'],
      [/@number/, 'number'],

      // punctuation: after number because of .\d floats
      [/[;,.]/, 'delimiter'],
    ],
  },
};
