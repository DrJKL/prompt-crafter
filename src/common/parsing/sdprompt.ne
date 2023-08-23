@preprocessor typescript
@{%
    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {constructVariants, flattenVariantsList, constructBound, constructWildcard,  constructGroup, constructLiteral} from './parse_utils';
    
    /* Utility */
    // const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
%}

@lexer basicPromptLexer

variant_prompt   -> (variant_chunk {% id %}):+                                        

variant_chunk    -> (%literal  | group | variants | wildcard |  unknown)              {% unwrap %}
variants         -> %vstart bound:? variants_list:?  %vend                            {% constructVariants %}
variants_list    -> variant_prompt (%bar variant_prompt {% (data) => data[1][0] %} 
                                   |%bar {% _ => [constructLiteral('')] %}):*         {% flattenVariantsList %}
bound            -> %bound                                                            {% constructBound %}
wildcard         -> %wildcardstart %literal %wildcardend                              {% constructWildcard %}
group            -> %gstart variant_prompt:? %weight:? %gend                          {% constructGroup %}
unknown          -> (%vstart|%gstart|%wildcardstart) [\s\n]:*