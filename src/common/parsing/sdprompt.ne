@preprocessor typescript
@{%
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
%}

@lexer basicPromptLexer

variant_prompt   -> %optionweight:? (variant_chunk {% id %}):+                                       {% ([_option, chunks]) => [chunks] %}
                  | %comment                                                                         {% data => [data] %}

variant_chunk    -> (%literal | group | variable | variants | wildcard |  unknown)                   {% unwrap %}
variants         -> %vstart bound:? variants_list:?  %vend                                           {% constructVariants %}
variable         -> %varstart %variableName (( %assignment      {% id %}
                                             | %colon           {% id %}
                                             | %immediateAssign {% id %}) variant_prompt ):?  %vend  {% constructVariable %}

variants_list    -> variant_prompt (%bar variant_prompt {% (data) => data[1][0] %} 
                                   |%bar                {% _ => [constructLiteral('')] %}):*         {% flattenVariantsList %}

bound            -> %bound                                                                           {% constructBound %}
wildcard         -> %wildcardstart %literal %wildcardend                                             {% constructWildcard %}
group            -> %gstart variant_prompt:? %weight:? %gend                                         {% constructGroup %}

unknown          -> (%vstart|%gstart|%wildcardstart) [\s\n]:*