@preprocessor typescript
@{%
    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {Token} from 'moo';
    interface Bound {
        min: string;
        max: string;
    }
    const DEFAULT_BOUND: Bound = {
        min: "1",
        max: "1",
    };
    
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
    
    function wrapVariants([,bound, variants]: [unknown, Bound|undefined, string[]]) {
        return {
            type: 'variants',
            bound: bound ?? DEFAULT_BOUND,
            variants,
        };
    }

    function flattenVariantsList([firstVariant, restOfVariants]: any[]) {
        return [firstVariant[0], ...restOfVariants];
    }

    function constructLiteral([literalToken]: [Token]) {
        return {
            type: 'literal',
            value: literalToken.value,
        }
    }

    function constructBound([minToken, maxToken]: [Token, Token]) {
        return ({
            type: 'bound',
            min: minToken.value,
            max: maxToken?.value ?? minToken.value,
        });
    }
    function constructWildcard([,wildcardPath]: [unknown, Token]) {
        return {
            type: 'wildcard',
            path: wildcardPath,
        };
    }

%}

@lexer basicPromptLexer
variant_prompt           -> (variant_chunk {% id %}):*                                        {% id %}

variant_chunk            -> (variants | wildcard | variant_literal_sequence)                  {% unwrap %}
variants                 -> %lmoustache bound:? variants_list:?  %rmoustache                  {% wrapVariants %}
variants_list            -> variant (%bar variant {% (data) => data[1][0] %}):*               {% flattenVariantsList %}
variant                  -> weight:? variant_prompt                                           {% data => data[1] %}

weight                   -> %number | %integer                                                {% tag('weight')  %}
bound                    -> %integer (%dash %integer {% data => data[1] %}):? %dollar %dollar {% constructBound %}

wildcard                 -> %wildcard_enclosure %path %wildcard_enclosure                     {% constructWildcard %}
variant_literal_sequence -> (%variant_literal {% constructLiteral %}):+                       {% unwrap %}