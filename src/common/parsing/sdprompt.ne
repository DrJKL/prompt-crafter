@preprocessor typescript
@{%
    // eslint-disable
    // @ts-nocheck
    import {basicPromptLexer} from './sdprompt_lexer';
    import {Bound, Literal, Wildcard, Variants, DEFAULT_BOUND} from '../rendering/parsed_types';
    
    const BOUND_FORMAT = new RegExp('(?<min>\\d+)?(?:(?<dash>-)(?<max>\\d+)?)?\\$\\$(?:(?<separator>[^$]+?)\\$\\$)?');
    
    /* Utility */
    const tag = (key: string) => (data: any[]) => [key, ...data.flat()]; 
    const unwrap = (data: any[]) => data[0][0];
    
    /* Chunks */
    function flattenVariantsList([firstVariant, restOfVariants]: any[]) {
        return [firstVariant[0], ...restOfVariants];
    }

    function constructVariants([,bound, variants]: any[]): Variants {
        return {
            type: 'variants',
            bound: bound ?? DEFAULT_BOUND,
            variants,
        };
    }

    function constructLiteral([literalToken]: any[]): Literal {
        return {
            type: 'literal',
            value: literalToken.value,
        }
    }

    function constructBound([boundString]: any[]): Bound {
        const matches = BOUND_FORMAT.exec(boundString.value);
        if (matches && matches.groups) {
            const hasDash = !!matches.groups['dash'];
            const minMaybe = safeNumberParse(matches.groups['min']);
            const maxMaybe = safeNumberParse(matches.groups['max']);
            const min = minMaybe ?? 1;
            const max = maxMaybe ?? (hasDash ? -1 : min);
            const separator = matches.groups['separator'] ?? ', ';
            return ({
                type: 'bound',
                min,
                max,
                separator,
            });
        }
        return DEFAULT_BOUND;
    }

    function constructWildcard([wildcardPath]: any[]): Wildcard {
        return {
            type: 'wildcard',
            path: wildcardPath.value,
        };
    }

    /* Types */
    function safeNumberParse(value: string): number|undefined {
        const numberMaybe = Number(value);
        if (isNaN(numberMaybe)) {
            return undefined;
        }
        return numberMaybe;
    }

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