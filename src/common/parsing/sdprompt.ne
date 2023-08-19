@preprocessor typescript
@{%
    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {constructVariants, flattenVariantsList, constructBound, constructWildcard, constructLiteral, constructGroup} from './parse_utils';
    
    /* Utility */
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
%}

@lexer basicPromptLexer

variant_prompt   -> (variant_chunk {% id %}):*                          

variant_chunk    -> (variants | wildcard | literal_sequence | group | unknown) {% unwrap %}
variants         -> %vstart bound:? variants_list:?  %vend                     {% constructVariants %}
variants_list    -> variant (%bar variant {% (data) => data[1][0] %}):*        {% flattenVariantsList %}
variant          -> weight:? variant_prompt                                    {% data => data[1] %}

bound            -> %bound                                                     {% constructBound %}

wildcard         -> %wildcard                                                  {% constructWildcard %}
literal_sequence -> (%literal {% constructLiteral %}):+                        {% unwrap %}
group            -> %gstart variant (%weight {% id %}):? %gend                 {% constructGroup %}
unknown          -> %vstart [\s\n]:*