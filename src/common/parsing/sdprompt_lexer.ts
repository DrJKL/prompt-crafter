import moo, { Rules } from 'moo';
const wildcard_enclosure = '__' as const;

const WEIGHT_PARTIAL = '\\s*\\d+(?:\\.\\d*)?\\s*(?=\\))';
const WEIGHT_PATTERN = `:${WEIGHT_PARTIAL}`;
const ANTIWEIGHT_PATTERN = `:(?!${WEIGHT_PARTIAL})`;

const mainRule: Rules = {
  vstart: { match: /\{\s*?/, push: 'variant' },
  gstart: { match: '(', push: 'group' },
  wildcardstart: {
    match: wildcard_enclosure,
    push: 'wildcard',
  },

  literal: {
    match: new RegExp(`[^#|\${}()_]+`),
    lineBreaks: true,
  },
};

const variantRule: Rules = {
  bound: [
    /\d+\$\$(?:[^$|}]+?\$\$)?/, // min
    /-\d+\$\$(?:[^$|}]+?\$\$)?/, // min-omitted
    /\d+-\$\$(?:[^$|}]+?\$\$)?/, // max_omitted
    /\d+-\d+\$\$(?:[^$|}]+?\$\$)?/, // min-max
    /\$\$(?:[^$|}]+?\$\$)?/, // no-bound
  ],
  ...mainRule,
  vend: { match: /\s*?\}/, pop: 1 },
  bar: /\s*\|\s*/,
};

const groupRule: Rules = {
  ...mainRule,
  weight: {
    match: new RegExp(WEIGHT_PATTERN),
    value: (x: string) => x.substring(1),
  },
  gend: { match: ')', pop: 1 },
  literal: {
    match: new RegExp(
      `(?:[^{}_():]|(?:${ANTIWEIGHT_PATTERN}))+(?!${WEIGHT_PATTERN})?`,
    ),
    lineBreaks: true,
  },
};

const wildcardRule = {
  ...mainRule,
  wildcardend: { match: wildcard_enclosure, pop: 1 },
};

export const basicPromptLexer = moo.states({
  main: mainRule,
  group: groupRule,
  variant: variantRule,
  wildcard: wildcardRule,
});
