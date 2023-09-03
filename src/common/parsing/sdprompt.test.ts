import nearley from 'nearley';
import { assertType, describe, expect, expectTypeOf, test } from 'vitest';
import { LANDSCAPE_VERY_DYNAMIC } from '../../examples/prompts';
import {
  Bound,
  Chunk,
  ParseResult,
  Variable,
  Variants,
} from '../rendering/parsed_types';
import { countType } from './parse_utils';
import grammar from './sdprompt';

interface ParserFixtures {
  parser: nearley.Parser;
}

const parserIt = test.extend<ParserFixtures>({
  parser: async ({ task: _task }, use: unknown) => {
    const maybeUse = use as unknown as (p: nearley.Parser) => void;
    await maybeUse(new nearley.Parser(nearley.Grammar.fromCompiled(grammar)));
  },
});

describe('parser', () => {
  parserIt('should parse a simple prompt', ({ parser }) => {
    const prompt = `a picture of a dog wearing a fancy hat`;
    parser.feed(prompt);
    expect(parser.results.length).toBe(1);
  });

  parserIt('should parse a long dynamic prompt', ({ parser }) => {
    const prompt = LANDSCAPE_VERY_DYNAMIC;
    parser.feed(prompt);
    expect(parser.results.length).toBe(1);
  });

  describe('grouping (weighted)', () => {
    parserIt('should handle grouping', ({ parser }) => {
      const prompt = `(a picture) of a (dog) (wearing a fancy) hat`;
      parser.feed(prompt);
      expect(parser.results.length).toBe(1);
    });

    parserIt('should handle grouping with weights', ({ parser }) => {
      const prompt = `(a picture:1.1) of a (dog:1.2) (wearing a fancy:0.8) hat`;
      parser.feed(prompt);
      expect(parser.results.length).toBe(1);
    });
  });
  describe('variants', () => {
    parserIt('should parse a prompt with variants', ({ parser }) => {
      const prompt = `a picture of a {dog|cat|frog} wearing a fancy hat`;
      parser.feed(prompt);
      expect(parser.results.length).toBe(1);
    });

    parserIt('should handle nested variants', ({ parser }) => {
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
      parserIt('should handle no bound', ({ parser }) => {
        const prompt = `{A|B|C|D|E}`;
        parser.feed(prompt);
        const [[result]] = parser.results;
        const [variants] = result;
        const { bound }: { bound: Bound } = variants;
        expect(bound.min).toBe(1);
        expect(bound.max).toBe(1);
      });

      parserIt('should handle just min', ({ parser }) => {
        const prompt = `{3$$A|B|C|D|E}`;
        parser.feed(prompt);

        const [[result]] = parser.results;
        const [variants]: [Variants] = result;
        const { bound }: { bound: Bound } = variants;

        expect(bound.min).toBe(3);
        expect(bound.max).toBe(3);
      });
      parserIt('should handle min dash', ({ parser }) => {
        const prompt = `{3-$$A|B|C|D|E}`;
        parser.feed(prompt);

        const [[result]] = parser.results;
        const [variants] = result;
        const { bound }: { bound: Bound } = variants;

        expect(bound.min).toBe(3);
        expect(bound.max).toBe(-1);
      });

      parserIt('should handle just max', ({ parser }) => {
        const prompt = `{-3$$A|B|C|D|E}`;
        parser.feed(prompt);

        const [[result]] = parser.results;
        const [variants] = result;
        const { bound }: { bound: Bound } = variants;

        expect(bound.min).toBe(1);
        expect(bound.max).toBe(3);
      });
      parserIt('should handle just min-max', ({ parser }) => {
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
      parserIt('should handle bare separator', ({ parser }) => {
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

    parserIt('should handle bounds and separator', ({ parser }) => {
      const prompt = `{2-3$$ and $$ A|B|C|D|E}`;
      parser.feed(prompt);

      const [[result]] = parser.results;
      const [variants] = result;
      const { bound }: { bound: Bound } = variants;

      expect(bound.min).toBe(2);
      expect(bound.max).toBe(3);
      expect(bound.separator).toBe(' and ');
    });

    parserIt(
      'should handle multiple wildcard sets with separators',
      ({ parser }) => {
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
      },
    );

    describe('weighting', () => {
      parserIt('should accept weighted options', ({ parser }) => {
        const prompt = `{0.5::summer|0.1::autumn|0.3::winter|0.1::spring}`;
        parser.feed(prompt);

        const [[result]] = parser.results;
        const [variants1] = result;
        console.log(JSON.stringify(variants1, null, 2));
      });
    });

    describe('variable', () => {
      parserIt('variable assignment', ({ parser }) => {
        const prompt = '${foo=bar}';
        parser.feed(prompt);
        const [[result]]: ParseResult = parser.results;
        const [variable] = result;
        expect(variable.type).toBe('variable');
        if (variable.type !== 'variable') {
          return;
        }
        assertType<Variable>(variable);
        expect(variable.flavor).toBe('assignment');
      });

      parserIt('variable assignment (immediate)', ({ parser }) => {
        const prompt = '${foo=!{alfa|bravo|charlie}}';
        parser.feed(prompt);
        const [[result]]: ParseResult = parser.results;
        const [variable] = result;
        expect(variable.type).toBe('variable');
        if (variable.type !== 'variable') {
          return;
        }
        assertType<Variable>(variable);
        expect(variable.flavor).toBe('assignmentImmediate');
      });

      parserIt('variable access default', ({ parser }) => {
        const prompt = '${foo:bar}';
        parser.feed(prompt);
        const [[result]]: ParseResult = parser.results;
        const [variable] = result;
        expect(variable.type).toBe('variable');
        if (variable.type !== 'variable') {
          return;
        }
        assertType<Variable>(variable);
        expect(variable.flavor).toBe('accessWithDefault');
      });
    });
  });
});
