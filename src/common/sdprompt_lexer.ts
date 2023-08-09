import moo from 'moo';

export const basicPromptLexer = moo.compile({
  integer: /\d+/,
  number: [/[0-9]+\.[0-9]+/, /[0-9]+\.\b/, /\.[0-9]+/, /[0-9]+/],
  lmoustache: '{',
  rmoustache: '}',
  bar: '|',
  dash: '-',
  dollar: '$',
  wildcard_enclosure: '__',
  path: /[^{}#\n\s]+(?=__)/,
  variant_literal: { match: /[^#$|{}]+/, lineBreaks: true }, // Has to come before literal
  literal: { match: /[^#{|]+/, lineBreaks: true },
  NL: { match: /\n/, lineBreaks: true },
});
