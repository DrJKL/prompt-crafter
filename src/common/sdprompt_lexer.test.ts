import { describe, it } from 'vitest';
import { basicPromptLexer } from './sdprompt_lexer';
import { LANDSCAPE_VERY_DYNAMIC } from '../examples/prompts';

describe('basicPromptLexer', () => {
  it('should lex a prompt with no weights', () => {
    const prompt = `a picture of a dog wearing a fancy hat`;
    basicPromptLexer.reset(prompt);
    for (const seg of basicPromptLexer) {
      console.log(seg);
    }
  });

  it('should lex a long dynamic prompt', () => {
    basicPromptLexer.reset(LANDSCAPE_VERY_DYNAMIC);
    console.log(
      Array.from(basicPromptLexer)
        .map((t) => t.type)
        .join(' '),
    );
  });
});
