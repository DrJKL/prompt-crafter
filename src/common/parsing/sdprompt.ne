@preprocessor typescript
@{%
    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {Bound, Literal, Wildcard, Variants, DEFAULT_BOUND} from '../rendering/parsed_types';
    import {constructVariants, flattenVariantsList, constructBound, constructWildcard, constructLiteral} from './parse_utils';
    
    
    /* Utility */
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
    

%}

@lexer basicPromptLexer

variant_prompt   -> (variant_chunk {% id %}):*                          {% id %}

variant_chunk    -> (variants | wildcard | literal_sequence | unknown)  {% unwrap %}
variants         -> %lmoustache bound:? variants_list:?  %rmoustache    {% constructVariants %}
variants_list    -> variant (%bar variant {% (data) => data[1][0] %}):* {% flattenVariantsList %}
variant          -> weight:? variant_prompt                             {% data => data[1] %}

weight           -> %number | %integer                                  {% tag('weight')  %}
bound            -> %bound                                              {% constructBound %}

wildcard         -> %wildcard                                           {% constructWildcard %}
literal_sequence -> (%literal {% constructLiteral %}):+                 {% unwrap %}
unknown          -> %lmoustache [\s\n]:*