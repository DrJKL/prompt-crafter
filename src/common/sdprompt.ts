// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var lmoustache: any;
declare var rmoustache: any;
declare var bar: any;
declare var number: any;
declare var integer: any;
declare var dash: any;
declare var dollar: any;
declare var wildcard_enclosure: any;
declare var path: any;
declare var variant_literal: any;

    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
    const DEFAULT_BOUND = {
        min: "1",
        max: "1",
    };

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
    {"name": "variant_prompt$ebnf$1", "symbols": ["variant_prompt$ebnf$1", "variant_chunk"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variant_prompt", "symbols": ["variant_prompt$ebnf$1"], "postprocess": id},
    {"name": "variant_chunk$subexpression$1", "symbols": ["variants"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["wildcard"]},
    {"name": "variant_chunk$subexpression$1", "symbols": ["variant_literal_sequence"]},
    {"name": "variant_chunk", "symbols": ["variant_chunk$subexpression$1"], "postprocess": unwrap},
    {"name": "variants$ebnf$1", "symbols": ["bound"], "postprocess": id},
    {"name": "variants$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "variants$ebnf$2", "symbols": ["variants_list"], "postprocess": id},
    {"name": "variants$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "variants", "symbols": [(basicPromptLexer.has("lmoustache") ? {type: "lmoustache"} : lmoustache), "variants$ebnf$1", "variants$ebnf$2", (basicPromptLexer.has("rmoustache") ? {type: "rmoustache"} : rmoustache)], "postprocess": 
        (data) => ({
                bound: data[1] ?? DEFAULT_BOUND,
                variants: data[2],
                })
        },
    {"name": "variants_list$ebnf$1", "symbols": []},
    {"name": "variants_list$ebnf$1$subexpression$1", "symbols": [(basicPromptLexer.has("bar") ? {type: "bar"} : bar), "variant"], "postprocess": (data) => data[1][0]},
    {"name": "variants_list$ebnf$1", "symbols": ["variants_list$ebnf$1", "variants_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variants_list", "symbols": ["variant", "variants_list$ebnf$1"], "postprocess": 
        data => [data[0][0], ...data[1]]
        },
    {"name": "variant$ebnf$1", "symbols": ["weight"], "postprocess": id},
    {"name": "variant$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "variant", "symbols": ["variant$ebnf$1", "variant_prompt"], "postprocess": data => data[1]},
    {"name": "weight", "symbols": [(basicPromptLexer.has("number") ? {type: "number"} : number)]},
    {"name": "weight", "symbols": [(basicPromptLexer.has("integer") ? {type: "integer"} : integer)], "postprocess": tag('weight')},
    {"name": "bound$ebnf$1$subexpression$1", "symbols": [(basicPromptLexer.has("dash") ? {type: "dash"} : dash), (basicPromptLexer.has("integer") ? {type: "integer"} : integer)], "postprocess": data => data[1]},
    {"name": "bound$ebnf$1", "symbols": ["bound$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "bound$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "bound", "symbols": [(basicPromptLexer.has("integer") ? {type: "integer"} : integer), "bound$ebnf$1", (basicPromptLexer.has("dollar") ? {type: "dollar"} : dollar), (basicPromptLexer.has("dollar") ? {type: "dollar"} : dollar)], "postprocess":  data => ({
            min: data[0].value,
            max: data[1].value ?? data[0].value
        }) },
    {"name": "wildcard", "symbols": [(basicPromptLexer.has("wildcard_enclosure") ? {type: "wildcard_enclosure"} : wildcard_enclosure), (basicPromptLexer.has("path") ? {type: "path"} : path), (basicPromptLexer.has("wildcard_enclosure") ? {type: "wildcard_enclosure"} : wildcard_enclosure)], "postprocess": 
        (data) => ({
           type: 'wildcard',
           path: data[1],
           })
        },
    {"name": "variant_literal_sequence$ebnf$1$subexpression$1", "symbols": [(basicPromptLexer.has("variant_literal") ? {type: "variant_literal"} : variant_literal)], "postprocess":  data => {
            return data[0].value;
        } },
    {"name": "variant_literal_sequence$ebnf$1", "symbols": ["variant_literal_sequence$ebnf$1$subexpression$1"]},
    {"name": "variant_literal_sequence$ebnf$1$subexpression$2", "symbols": [(basicPromptLexer.has("variant_literal") ? {type: "variant_literal"} : variant_literal)], "postprocess":  data => {
            return data[0].value;
        } },
    {"name": "variant_literal_sequence$ebnf$1", "symbols": ["variant_literal_sequence$ebnf$1", "variant_literal_sequence$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variant_literal_sequence", "symbols": ["variant_literal_sequence$ebnf$1"], "postprocess": unwrap}
  ],
  ParserStart: "variant_prompt",
};

export default grammar;
