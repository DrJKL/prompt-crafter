import moo from 'moo';

export const basicPromptLexer = moo.compile({
  // WS: { match: /[ \t\n]+/, lineBreaks: true },
  integer: /\d+/,
  number: [/[0-9]+\.[0-9]+/, /[0-9]+\.\b/, /\.[0-9]+/, /[0-9]+/],
  // lparen: '(',
  // rparen: ')',
  // lsqbracket: '[',
  // rsqbracket: ']',
  lmoustache: '{',
  rmoustache: '}',
  bar: '|',
  // colon: ':',
  // comma: ',',
  dash: '-',
  dollar: '$',
  wildcard_enclosure: '__',
  variant_literal: { match: /[^#$|{}]+/, lineBreaks: true }, // Has to come before literal
  literal: { match: /[^#{|]+/, lineBreaks: true },
  path: /[^{}#\n\s]+/,
  NL: { match: /\n/, lineBreaks: true },
});
