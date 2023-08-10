import { describe, it } from 'vitest';
import { LANDSCAPE_VERY_DYNAMIC } from '../examples/prompts';
import grammar from './sdprompt';
import nearley from 'nearley';

describe('parser', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

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
    const prompt = LANDSCAPE_VERY_DYNAMIC;
    parser.feed(prompt);
    // console.log(JSON.stringify(parser.results, null, 2));
  });
});
