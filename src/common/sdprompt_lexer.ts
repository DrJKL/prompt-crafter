import moo from 'moo';

export const basicPromptLexer = moo.compile({
  WS: /[ \t]+/,
  intRange: /\d+-\d+/,
  number: [/[0-9]+\.[0-9]+/, /[0-9]+\.\b/, /\.[0-9]+/, /[0-9]+/],
  lparen: '(',
  rparen: ')',
  lsqbracket: '[',
  rsqbracket: ']',
  lmoustache: '{',
  rmoustache: '}',
  bar: '|',
  colon: ':',
  comma: ',',
  dollar: '$',
  dash: '-',
  word: /[^ }\n]+/,
  NL: { match: /\n/, lineBreaks: true },
});
