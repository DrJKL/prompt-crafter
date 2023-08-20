import moo, { Rules } from 'moo';
const wildcard_enclosure = '__' as const;

const mainRule: Rules = {
  vstart: { match: /\{\s*?/, push: 'variant' },
  gstart: { match: '(', push: 'group' },
  wildcardstart: {
    match: wildcard_enclosure,
    push: 'wildcard',
  },

  literal: { match: /[^#|${}()_]+/, lineBreaks: true },
};

const variantRule: Rules = {
  vend: { match: /\s*?\}/, pop: 1 },
  bar: /\s*\|\s*/,
  bound: [
    /\d+\$\$(?:[^$|}]+?\$\$)?/, // min
    /-\d+\$\$(?:[^$|}]+?\$\$)?/, // min-omitted
    /\d+-\$\$(?:[^$|}]+?\$\$)?/, // max_omitted
    /\d+-\d+\$\$(?:[^$|}]+?\$\$)?/, // min-max
    /\$\$(?:[^$|}]+?\$\$)?/, // no-bound
  ],

  literal: { match: /[^|${}]+/, lineBreaks: true },
  ...mainRule,
};

const groupRule: Rules = {
  weight: { match: /:\d+(?:\.\d*)?(?=\))/ },
  gend: { match: ')', pop: 1 },
  literal: { match: /[^):]+/, lineBreaks: true },
  ...mainRule,
};

const wildcardRule = {
  wildcardend: { match: wildcard_enclosure, pop: 1 },

  literal: { match: /[^]+/, lineBreaks: true },
  ...mainRule,
};

export const basicPromptLexer = moo.states({
  group: groupRule,
  variant: variantRule,
  wildcard: wildcardRule,
  main: mainRule,
});
