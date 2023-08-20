// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var vstart: any;
declare var vend: any;
declare var bar: any;
declare var bound: any;
declare var wildcardstart: any;
declare var literal: any;
declare var wildcardend: any;
declare var gstart: any;
declare var weight: any;
declare var gend: any;

    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {constructVariants, flattenVariantsList, constructBound, constructWildcard, constructLiteral, constructGroup} from './parse_utils';
    
    /* Utility */
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: basicPromptLexer,
  ParserRules: [
    {"name": "variant_prompt$ebnf$1", "symbols": []},
    {"name": "variant_prompt$ebnf$1$subexpression$1", "symbols": ["variant_chunk"], "postprocess": id},
    {"name": "variant_prompt$ebnf$1", "symbols": ["variant_prompt$ebnf$1", "variant_prompt$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variant_prompt", "symbols": ["variant_prompt$ebnf$1"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["variants"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["wildcard"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["literal_sequence"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["group"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["unknown"]},
    {"name": "variant_chunk", "symbols": ["variant_chunk$subexpression$1"], "postprocess": unwrap},
    {"name": "variants$ebnf$1", "symbols": ["bound"], "postprocess": id},
    {"name": "variants$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "variants$ebnf$2", "symbols": ["variants_list"], "postprocess": id},
    {"name": "variants$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "variants", "symbols": [(basicPromptLexer.has("vstart") ? {type: "vstart"} : vstart), "variants$ebnf$1", "variants$ebnf$2", (basicPromptLexer.has("vend") ? {type: "vend"} : vend)], "postprocess": constructVariants},
    {"name": "variants_list$ebnf$1", "symbols": []},
    {"name": "variants_list$ebnf$1$subexpression$1", "symbols": [(basicPromptLexer.has("bar") ? {type: "bar"} : bar), "variant"], "postprocess": (data) => data[1][0]},
    {"name": "variants_list$ebnf$1", "symbols": ["variants_list$ebnf$1", "variants_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variants_list", "symbols": ["variant", "variants_list$ebnf$1"], "postprocess": flattenVariantsList},
    {"name": "variant$ebnf$1", "symbols": ["weight"], "postprocess": id},
    {"name": "variant$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "variant", "symbols": ["variant$ebnf$1", "variant_prompt"], "postprocess": data => data[1]},
    {"name": "bound", "symbols": [(basicPromptLexer.has("bound") ? {type: "bound"} : bound)], "postprocess": constructBound},
    {"name": "wildcard", "symbols": [(basicPromptLexer.has("wildcardstart") ? {type: "wildcardstart"} : wildcardstart), (basicPromptLexer.has("literal") ? {type: "literal"} : literal), (basicPromptLexer.has("wildcardend") ? {type: "wildcardend"} : wildcardend)], "postprocess": constructWildcard},
    {"name": "literal_sequence$ebnf$1$subexpression$1", "symbols": [(basicPromptLexer.has("literal") ? {type: "literal"} : literal)], "postprocess": constructLiteral},
    {"name": "literal_sequence$ebnf$1", "symbols": ["literal_sequence$ebnf$1$subexpression$1"]},
    {"name": "literal_sequence$ebnf$1$subexpression$2", "symbols": [(basicPromptLexer.has("literal") ? {type: "literal"} : literal)], "postprocess": constructLiteral},
    {"name": "literal_sequence$ebnf$1", "symbols": ["literal_sequence$ebnf$1", "literal_sequence$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "literal_sequence", "symbols": ["literal_sequence$ebnf$1"], "postprocess": unwrap},
    {"name": "group$ebnf$1", "symbols": ["variant"], "postprocess": id},
    {"name": "group$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "group$ebnf$2$subexpression$1", "symbols": [(basicPromptLexer.has("weight") ? {type: "weight"} : weight)], "postprocess": id},
    {"name": "group$ebnf$2", "symbols": ["group$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "group$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "group", "symbols": [(basicPromptLexer.has("gstart") ? {type: "gstart"} : gstart), "group$ebnf$1", "group$ebnf$2", (basicPromptLexer.has("gend") ? {type: "gend"} : gend)], "postprocess": constructGroup},
    {"name": "unknown$ebnf$1", "symbols": []},
    {"name": "unknown$ebnf$1", "symbols": ["unknown$ebnf$1", /[\s\n]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "unknown", "symbols": [(basicPromptLexer.has("vstart") ? {type: "vstart"} : vstart), "unknown$ebnf$1"]}
  ],
  ParserStart: "variant_prompt",
};

export default grammar;
