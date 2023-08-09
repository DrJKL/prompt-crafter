@preprocessor typescript
@{%
    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    const DEFAULT_BOUND = {
        min: "1",
        max: "1",
    };
    
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
    
    function wrapVariants(data: any[]) {
        return {
            type: 'variants',
            bound: data[1] ?? DEFAULT_BOUND,
            variants: data[2],
        };
    }
    function flattenVariantsList(data: any[]) {
        return [data[0][0], ...data[1]];
    }
    function lexerValue(data: any[]) {
        return data[0].value;
    }
    function constructLiteral(data: any[]) {
        return {
            type: 'literal',
            value: data[0].value,
        }
    }
    function constructBound(data: any[]) {
        return ({
            type: 'bound',
            min: data[0].value,
            max: data[1].value ?? data[0].value,
        });
    }
    function constructWildcard(data: any[]) {
        return {
            type: 'wildcard',
            path: data[1],
        };
    }

%}

@lexer basicPromptLexer
variant_prompt           -> (variant_chunk {% id %}):* {% id %}

variant_chunk            -> (variants | wildcard | variant_literal_sequence)                  {% unwrap %}
variants                 -> %lmoustache bound:? variants_list:?  %rmoustache                  {% wrapVariants %}
variants_list            -> variant (%bar variant {% (data) => data[1][0] %}):*               {% flattenVariantsList %}
variant                  -> weight:? variant_prompt                                           {% data => data[1] %}

weight                   -> %number | %integer                                                {% tag('weight')  %}
bound                    -> %integer (%dash %integer {% data => data[1] %}):? %dollar %dollar {% constructBound %}

wildcard                 -> %wildcard_enclosure %path %wildcard_enclosure                     {% constructWildcard %}
variant_literal_sequence -> (%variant_literal {% constructLiteral %}):+                             {% unwrap %}