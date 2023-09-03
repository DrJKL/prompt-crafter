// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var optionweight: any;
declare var literal: any;
declare var vstart: any;
declare var vend: any;
declare var varstart: any;
declare var variableName: any;
declare var assignment: any;
declare var colon: any;
declare var immediateAssign: any;
declare var bar: any;
declare var bound: any;
declare var wildcardstart: any;
declare var wildcardend: any;
declare var gstart: any;
declare var weight: any;
declare var gend: any;

    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {
        constructBound,
        constructGroup,
        constructLiteral,
        constructVariable,
        constructVariants,
        constructWildcard,
        flattenVariantsList,
    } from './parse_utils';
    
    /* Utility */
    // const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
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
    {"name": "variant_prompt$ebnf$1", "symbols": [(basicPromptLexer.has("optionweight") ? {type: "optionweight"} : optionweight)], "postprocess": id},
    {"name": "variant_prompt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "variant_prompt$ebnf$2$subexpression$1", "symbols": ["variant_chunk"], "postprocess": id},
    {"name": "variant_prompt$ebnf$2", "symbols": ["variant_prompt$ebnf$2$subexpression$1"]},
    {"name": "variant_prompt$ebnf$2$subexpression$2", "symbols": ["variant_chunk"], "postprocess": id},
    {"name": "variant_prompt$ebnf$2", "symbols": ["variant_prompt$ebnf$2", "variant_prompt$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variant_prompt", "symbols": ["variant_prompt$ebnf$1", "variant_prompt$ebnf$2"], "postprocess": ([_option, chunks]) => [chunks]},
    {"name": "variant_chunk$subexpression$1", "symbols": [(basicPromptLexer.has("literal") ? {type: "literal"} : literal)]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["group"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["variable"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["variants"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["wildcard"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["unknown"]},
    {"name": "variant_chunk", "symbols": ["variant_chunk$subexpression$1"], "postprocess": unwrap},
    {"name": "variants$ebnf$1", "symbols": ["bound"], "postprocess": id},
    {"name": "variants$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "variants$ebnf$2", "symbols": ["variants_list"], "postprocess": id},
    {"name": "variants$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "variants", "symbols": [(basicPromptLexer.has("vstart") ? {type: "vstart"} : vstart), "variants$ebnf$1", "variants$ebnf$2", (basicPromptLexer.has("vend") ? {type: "vend"} : vend)], "postprocess": constructVariants},
    {"name": "variable$ebnf$1$subexpression$1$subexpression$1", "symbols": [(basicPromptLexer.has("assignment") ? {type: "assignment"} : assignment)], "postprocess": id},
    {"name": "variable$ebnf$1$subexpression$1$subexpression$1", "symbols": [(basicPromptLexer.has("colon") ? {type: "colon"} : colon)], "postprocess": id},
    {"name": "variable$ebnf$1$subexpression$1$subexpression$1", "symbols": [(basicPromptLexer.has("immediateAssign") ? {type: "immediateAssign"} : immediateAssign)], "postprocess": id},
    {"name": "variable$ebnf$1$subexpression$1", "symbols": ["variable$ebnf$1$subexpression$1$subexpression$1", "variant_prompt"]},
    {"name": "variable$ebnf$1", "symbols": ["variable$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "variable$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "variable", "symbols": [(basicPromptLexer.has("varstart") ? {type: "varstart"} : varstart), (basicPromptLexer.has("variableName") ? {type: "variableName"} : variableName), "variable$ebnf$1", (basicPromptLexer.has("vend") ? {type: "vend"} : vend)], "postprocess": constructVariable},
    {"name": "variants_list$ebnf$1", "symbols": []},
    {"name": "variants_list$ebnf$1$subexpression$1", "symbols": [(basicPromptLexer.has("bar") ? {type: "bar"} : bar), "variant_prompt"], "postprocess": (data) => data[1][0]},
    {"name": "variants_list$ebnf$1$subexpression$1", "symbols": [(basicPromptLexer.has("bar") ? {type: "bar"} : bar)], "postprocess": _ => [constructLiteral('')]},
    {"name": "variants_list$ebnf$1", "symbols": ["variants_list$ebnf$1", "variants_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variants_list", "symbols": ["variant_prompt", "variants_list$ebnf$1"], "postprocess": flattenVariantsList},
    {"name": "bound", "symbols": [(basicPromptLexer.has("bound") ? {type: "bound"} : bound)], "postprocess": constructBound},
    {"name": "wildcard", "symbols": [(basicPromptLexer.has("wildcardstart") ? {type: "wildcardstart"} : wildcardstart), (basicPromptLexer.has("literal") ? {type: "literal"} : literal), (basicPromptLexer.has("wildcardend") ? {type: "wildcardend"} : wildcardend)], "postprocess": constructWildcard},
    {"name": "group$ebnf$1", "symbols": ["variant_prompt"], "postprocess": id},
    {"name": "group$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "group$ebnf$2", "symbols": [(basicPromptLexer.has("weight") ? {type: "weight"} : weight)], "postprocess": id},
    {"name": "group$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "group", "symbols": [(basicPromptLexer.has("gstart") ? {type: "gstart"} : gstart), "group$ebnf$1", "group$ebnf$2", (basicPromptLexer.has("gend") ? {type: "gend"} : gend)], "postprocess": constructGroup},
    {"name": "unknown$subexpression$1", "symbols": [(basicPromptLexer.has("vstart") ? {type: "vstart"} : vstart)]},
    {"name": "unknown$subexpression$1", "symbols": [(basicPromptLexer.has("gstart") ? {type: "gstart"} : gstart)]},
    {"name": "unknown$subexpression$1", "symbols": [(basicPromptLexer.has("wildcardstart") ? {type: "wildcardstart"} : wildcardstart)]},
    {"name": "unknown$ebnf$1", "symbols": []},
    {"name": "unknown$ebnf$1", "symbols": ["unknown$ebnf$1", /[\s\n]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "unknown", "symbols": ["unknown$subexpression$1", "unknown$ebnf$1"]}
  ],
  ParserStart: "variant_prompt",
};

export default grammar;
