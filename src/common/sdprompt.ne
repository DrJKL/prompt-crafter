@preprocessor typescript
@{%
    import {basicPromptLexer} from './sdprompt_lexer';
    const tag = (key) => (data) => [key, ...data.flat()]; 
    const unwrap = (data) => data[0][0];
    const DEFAULT_BOUND = {
        min: "1",
        max: "1",
    };
%}

@lexer basicPromptLexer
main                     -> (prompt | variant_prompt) {% unwrap %}

variant_prompt           -> variant_chunk:* {% id %}

variant_chunk            -> (variants | wildcard | variant_literal_sequence) {% unwrap %}

variants                 -> %lmoustache bound:? variants_list:?  %rmoustache {%
    (data) => ({
            bound: data[1] ?? DEFAULT_BOUND,
            variants: data[2],
            })
%}
variants_list            -> variant (%bar variant {% (data) => data[1][0] %}):* {%
    data => [data[0][0], ...data[1]]
%}
variant                  -> weight:? variant_prompt {% data => data[1] %}
weight                   -> %number | %integer {% tag('weight')  %}
bound                    -> %integer (%dash %integer {% data => data[1] %}):? %dollar %dollar {% data => ({
    min: data[0].value,
    max: data[1].value ?? data[0].value
}) %}
wildcard                 -> %wildcard_enclosure %path %wildcard_enclosure {%
 (data) => ({
    type: 'wildcard',
    path: data[1],
    })
%}
variant_literal_sequence -> (%variant_literal {% data => {
    return data[0].value;
} %}):+ {% unwrap %}