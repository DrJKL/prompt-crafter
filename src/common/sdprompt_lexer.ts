import moo from 'moo';
const wildcard_enclosure = '__' as const;

export const basicPromptLexer = moo.compile({
  lmoustache: '{',
  rmoustache: '}',
  bar: '|',
  bound: {
    match: /\d+(?:-\d+)?\$\$/,
  },
  dash: '-',
  dollar: '$',
  wildcard: {
    match: new RegExp(
      `${wildcard_enclosure}[^{}#\\n\\s]+${wildcard_enclosure}`,
    ),
    value: (x) =>
      x.slice(wildcard_enclosure.length, -wildcard_enclosure.length),
  },
  variant_literal: { match: /[^#$|{}]+/, lineBreaks: true }, // Has to come before literal
  integer: /\d+/,
  number: [/[0-9]+\.[0-9]+/, /[0-9]+\.\b/, /\.[0-9]+/, /[0-9]+/],
  literal: { match: /[^#{|]+/, lineBreaks: true },
  NL: { match: /\n/, lineBreaks: true },
});
