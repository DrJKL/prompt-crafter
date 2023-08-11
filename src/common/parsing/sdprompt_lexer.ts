import moo from 'moo';
const wildcard_enclosure = '__' as const;

export const basicPromptLexer = moo.compile({
  lmoustache: '{',
  rmoustache: '}',
  bar: /\s*\|\s*/,
  bound: [
    /\d+\$\$(?:[^$|}]+?\$\$)?/, // min
    /-\d+\$\$(?:[^$|}]+?\$\$)?/, // min-omitted
    /\d+-\$\$(?:[^$|}]+?\$\$)?/, // max_omitted
    /\d+-\d+\$\$(?:[^$|}]+?\$\$)?/, // min-max
    /\$\$(?:[^$|}]+?\$\$)?/, // no-bound
  ],
  wildcard: {
    match: new RegExp(
      `${wildcard_enclosure}[^{}#\\n\\s]+${wildcard_enclosure}`,
    ),
    value: (x) =>
      x.slice(wildcard_enclosure.length, -wildcard_enclosure.length),
  },
  literal: { match: /[^#$|{}]+/, lineBreaks: true },
});
