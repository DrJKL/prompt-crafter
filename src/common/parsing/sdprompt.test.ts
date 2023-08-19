import nearley from 'nearley';
import { assertType, describe, expect, expectTypeOf, it } from 'vitest';
import { LANDSCAPE_VERY_DYNAMIC } from '../../examples/prompts';
import { Bound, Chunk, Variants } from '../rendering/parsed_types';
import { countType } from './parse_utils';
import grammar from './sdprompt';

describe('parser', () => {
  it('should lex a prompt with no weights', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `a picture of a dog wearing a fancy hat`;
    parser.feed(prompt);
    expect(parser.results.length).toBe(1);
  });

  it('should handle grouping', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `(a picture) of a (dog) (wearing a fancy) hat`;
    parser.feed(prompt);
    expect(parser.results.length).toBe(1);
  });

  it('should handle grouping with weights', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `(a picture:1.1) of a (dog:1.2) (wearing a fancy:0.8) hat`;
    parser.feed(prompt);
    expect(parser.results.length).toBe(1);
  });

  it('should lex a prompt with wildcards', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `a picture of a {dog|cat|frog} wearing a fancy hat`;
    parser.feed(prompt);
    expect(parser.results.length).toBe(1);
  });

  it('should parse a long dynamic prompt', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = LANDSCAPE_VERY_DYNAMIC;
    parser.feed(prompt);
    expect(parser.results.length).toBe(1);
  });

  it('should handle nested wildcards', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = '{ A | B | { C | D } }';
    parser.feed(prompt);

    const [results]: Array<Array<Array<Chunk>>> = parser.results;
    expectTypeOf(results).toBeArray();

    expect(results.length).toBe(1);
    const [variantPrompt] = results;

    expect(variantPrompt.length).toBe(1);
    const [variantChunk] = variantPrompt;
    expect(variantChunk.type).toBe('variants');

    if (variantChunk.type !== 'variants') {
      throw new Error();
    }
    assertType<Variants>(variantChunk);

    expect(countType(variantChunk.variants, 'literal')).toBe(2);
    expect(countType(variantChunk.variants, 'variants')).toBe(1);

    const [, , [nestedVariants]] = variantChunk.variants;
    expect(nestedVariants?.type).toBe('variants');

    if (nestedVariants.type !== 'variants') {
      throw new Error();
    }
    assertType<Variants>(nestedVariants);

    expect(countType(nestedVariants.variants, 'literal')).toBe(2);
  });

  describe('bounds', () => {
    it('should handle no bound', () => {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      const prompt = `{A|B|C|D|E}`;
      parser.feed(prompt);
      const [[result]] = parser.results;
      const [variants] = result;
      const { bound }: { bound: Bound } = variants;
      expect(bound.min).toBe(1);
      expect(bound.max).toBe(1);
    });

    it('should handle just min', () => {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      const prompt = `{3$$A|B|C|D|E}`;
      parser.feed(prompt);

      const [[result]] = parser.results;
      const [variants]: [Variants] = result;
      const { bound }: { bound: Bound } = variants;

      expect(bound.min).toBe(3);
      expect(bound.max).toBe(3);
    });
    it('should handle min dash', () => {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      const prompt = `{3-$$A|B|C|D|E}`;
      parser.feed(prompt);

      const [[result]] = parser.results;
      const [variants] = result;
      const { bound }: { bound: Bound } = variants;

      expect(bound.min).toBe(3);
      expect(bound.max).toBe(-1);
    });

    it('should handle just max', () => {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      const prompt = `{-3$$A|B|C|D|E}`;
      parser.feed(prompt);

      const [[result]] = parser.results;
      const [variants] = result;
      const { bound }: { bound: Bound } = variants;

      expect(bound.min).toBe(1);
      expect(bound.max).toBe(3);
    });
    it('should handle just min-max', () => {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      const prompt = `{2-3$$A|B|C|D|E}`;
      parser.feed(prompt);

      const [[result]] = parser.results;
      const [variants] = result;
      const { bound }: { bound: Bound } = variants;

      expect(bound.min).toBe(2);
      expect(bound.max).toBe(3);
    });
  });

  describe('separator', () => {
    it('should handle bare separator', () => {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      const prompt = `{$$ and $$ A|B|C|D|E}`;
      parser.feed(prompt);

      const [[result]] = parser.results;
      const [variants] = result;
      const { bound }: { bound: Bound } = variants;

      expect(bound.min).toBe(1);
      expect(bound.max).toBe(1);
      expect(bound.separator).toBe(' and ');
    });
  });

  it('should handle bounds and separator', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `{2-3$$ and $$ A|B|C|D|E}`;
    parser.feed(prompt);

    const [[result]] = parser.results;
    const [variants] = result;
    const { bound }: { bound: Bound } = variants;

    expect(bound.min).toBe(2);
    expect(bound.max).toBe(3);
    expect(bound.separator).toBe(' and ');
  });

  it('should handle multiple wildcard sets with separators', () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const prompt = `{2-3$$ and $$ A|B|C|D|E} {4-5$$ or $$ F|G|H|I|J}`;
    parser.feed(prompt);

    const [[result]] = parser.results;
    const [variants1, _, variants2] = result;
    const { bound: bounds1 }: { bound: Bound } = variants1;
    const { bound: bounds2 }: { bound: Bound } = variants2;

    expect(bounds1.min).toBe(2);
    expect(bounds1.max).toBe(3);
    expect(bounds1.separator).toBe(' and ');
    expect(bounds2.min).toBe(4);
    expect(bounds2.max).toBe(5);
    expect(bounds2.separator).toBe(' or ');
  });
});
