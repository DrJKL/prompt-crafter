@preprocessor typescript
@{%
    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {Bound, Literal, Wildcard, Variants} from './rendering/parsed_types';
    
    const DEFAULT_BOUND: Bound = {
        type: 'bound',
        min: 1,
        max: 1,
    };
    
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
    
    function wrapVariants([,bound, variants]: any[]): Variants {
        return {
            type: 'variants',
            bound: bound ?? DEFAULT_BOUND,
            variants,
        };
    }

    function flattenVariantsList([firstVariant, restOfVariants]: any[]) {
        return [firstVariant[0], ...restOfVariants];
    }

    function constructLiteral([literalToken]: any[]): Literal {
        return {
            type: 'literal',
            value: literalToken.value,
        }
    }
    function safeNumberParse(value: string): number {
        const numberMaybe = Number(value);
        if (isNaN(numberMaybe)) {
            return 1;
        }
        return numberMaybe;
    }

    function constructBound([minToken, maxToken]: any[]): Bound {
        return ({
            type: 'bound',
            min: safeNumberParse(minToken.value),
            max: safeNumberParse(maxToken?.value ?? minToken.value),
        });
    }
    function constructWildcard([wildcardPath]: any[]): Wildcard {
        return {
            type: 'wildcard',
            path: wildcardPath.value,
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

wildcard                 -> %wildcard                                                         {% constructWildcard %}
variant_literal_sequence -> (%variant_literal {% constructLiteral %}):+                       {% unwrap %}