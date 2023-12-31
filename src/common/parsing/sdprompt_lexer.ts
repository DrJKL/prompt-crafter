import moo, { Rules } from 'moo';
const wildcard_enclosure = '__' as const;

const WEIGHT_PARTIAL = '\\s*\\d+(?:\\.\\d*)?\\s*(?=\\))';
const WEIGHT_PATTERN = `:${WEIGHT_PARTIAL}`;
const ANTIWEIGHT_PATTERN = `:(?!${WEIGHT_PARTIAL})`;
const NON_WILDCARD_UNDERSCORE = `_(?!_)`;
const NUMBER = [
  `(?:\\d+)`,
  `(?:\\.\\d+)`,
  `(?:\\d+\\.)`,
  `(?:\\d+\\.\\d+)`,
].join('|');
const OPTION_WEIGHT_PATTERN = `(?:${NUMBER})::`;
const optionWeightMatcher = new RegExp(OPTION_WEIGHT_PATTERN);

const SEPARATOR_PATTERN = `\\$\\$(?:(?:[^$|}]|\\$(?!\\$))*?\\$\\$)?`;

const boundMatchers = [
  new RegExp(`\\d+${SEPARATOR_PATTERN}`), // min
  new RegExp(`-\\d+${SEPARATOR_PATTERN}`), // min-omitted
  new RegExp(`\\d+-${SEPARATOR_PATTERN}`), // max_omitted
  new RegExp(`\\d+-\\d+${SEPARATOR_PATTERN}`), // min-max
  new RegExp(`${SEPARATOR_PATTERN}`), // no-bound
];

const mainRule: Rules = {
  varstart: { match: /\$\{\s*?/, push: 'variable' },
  vstart: { match: /\{\s*?/, push: 'variant' },
  gstart: { match: '(', push: 'group' },
  wildcardstart: {
    match: wildcard_enclosure,
    push: 'wildcard',
  },
  comment: {
    match: /^\s*#[^\n]*/,
  },

  literal: {
    match: new RegExp(`(?:[^#|\${}()_]|${NON_WILDCARD_UNDERSCORE})+`),
    lineBreaks: true,
  },
};

const variantRule: Rules = {
  bound: boundMatchers,
  optionweight: { match: optionWeightMatcher },
  ...mainRule,
  vend: { match: /\s*?\}/, pop: 1 },
  bar: /\s*\|\s*/,
};

const variableRule: Rules = {
  variableName: { match: /(?<=\{)\s*?\w+(?=[=:]!?|\})/ },
  immediateAssign: '=!',
  assignment: { match: /=(?!!)/ },
  colon: ':',
  ...variantRule,
  ...mainRule,
};

const groupRule: Rules = {
  gend: { match: ')', pop: 1 },
  ...mainRule,
  weight: {
    match: new RegExp(WEIGHT_PATTERN),
    value: (x: string) => x.substring(1),
  },
  literal: {
    match: new RegExp(
      `(?:[^{}_():]|${ANTIWEIGHT_PATTERN})+(?!${WEIGHT_PATTERN})?`,
    ),
    lineBreaks: true,
  },
};

const wildcardRule = {
  wildcardend: { match: wildcard_enclosure, pop: 1 },
  ...mainRule,
};

export const basicPromptLexer = moo.states({
  main: mainRule,
  group: groupRule,
  variant: variantRule,
  variable: variableRule,
  wildcard: wildcardRule,
});
