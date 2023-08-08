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
  it('should handle bounds', () => {
    const prompt = `
      {2-4$$lone twisted tree | winding river| mountain peak| crumbling ruins| abandoned cabin|wooden fence | dramatic cliffs | stormy sea | rolling thunder | howling wind | foggy moor | charred forest | broken-down cart| towering dunes | parched canyon | bone-strewn pit | petrified woods| wrecked galleon | beast's den| majestic waterfall | calm lake | moonlit trail  | moss-covered stones | misty vale |ravaged battlefield | derelict mill}   
   `;
    basicPromptLexer.reset(prompt);
    console.log(
      Array.from(basicPromptLexer)
        .map((t) => t.type)
        .join(' '),
    );
  });
});
