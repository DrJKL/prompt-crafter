import { describe, expect, expectTypeOf, it } from 'vitest';
import { LANDSCAPE_VERY_DYNAMIC } from '../../examples/prompts';
import grammar from './sdprompt';
import nearley from 'nearley';
import { countType } from './parse_utils';

describe('parser', () => {
  it('should lex a prompt with no weights', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `a picture of a dog wearing a fancy hat`;
    parser.feed(prompt);
    // console.log(JSON.stringify(parser.results));
  });

  it('should lex a prompt with wildcards', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `a picture of a {dog|cat|frog} wearing a fancy hat`;
    parser.feed(prompt);
    // console.log(JSON.stringify(parser.results, null, 2));
  });

  it('should parse a long dynamic prompt', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = LANDSCAPE_VERY_DYNAMIC;
    parser.feed(prompt);
    // console.log(JSON.stringify(parser.results, null, 2));
  });

  it('should handle nested wildcards', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = '{ A | B | { C | D } }';
    parser.feed(prompt);

    const results = parser.results;
    expectTypeOf(results[0]).toBeArray();

    expect(results.length).toBe(1);
    const [variantPrompt] = results;

    expect(variantPrompt.length).toBe(1);
    const [variantChunk] = variantPrompt;
    expect(variantChunk.type).toBe('variants');

    expect(countType(variantChunk.variants, 'literal')).toBe(2);
    expect(countType(variantChunk.variants, 'variants')).toBe(1);

    const [, , nestedVariants] = variantChunk.variants;
    expect(nestedVariants?.type).toBe('variants');

    expect(countType(nestedVariants.variants, 'literal')).toBe(2);

    console.log(JSON.stringify(parser.results[0], null, 1));
  });
});
