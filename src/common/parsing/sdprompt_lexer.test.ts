import { describe, expect, it } from 'vitest';
import { basicPromptLexer } from './sdprompt_lexer';
import { LANDSCAPE_VERY_DYNAMIC } from '../../examples/prompts';

describe('basicPromptLexer', () => {
  it('should lex a prompt with no weights', () => {
    const prompt = `a picture of a dog wearing a fancy hat`;
    basicPromptLexer.reset(prompt);
    Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
  });

  it('should lex a long dynamic prompt', () => {
    basicPromptLexer.reset(LANDSCAPE_VERY_DYNAMIC);
    Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
  });

  it('should handle bounds', () => {
    const prompt = `
      {2-4$$lone twisted tree | winding river| mountain peak| crumbling ruins| abandoned cabin|wooden fence | dramatic cliffs | stormy sea | rolling thunder | howling wind | foggy moor | charred forest | broken-down cart| towering dunes | parched canyon | bone-strewn pit | petrified woods| wrecked galleon | beast's den| majestic waterfall | calm lake | moonlit trail  | moss-covered stones | misty vale |ravaged battlefield | derelict mill}   
   `;
    basicPromptLexer.reset(prompt);
    Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
  });

  it('should lex nested variants', () => {
    const prompt = `{a|b|{c|d|e}}`;
    basicPromptLexer.reset(prompt);

    Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
  });

  it('should lex with separator', () => {
    const prompt = `{$$ and $$ foo | bar | baz}`;

    basicPromptLexer.reset(prompt);

    const result = Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
    expect(result).toBeTruthy();
  });

  it('should lex with groups', () => {
    const prompt = `(a dog) with a (fancy hat)`;

    basicPromptLexer.reset(prompt);

    const result = Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
    expect(result).toBeTruthy();
  });

  it('should lex with weighted groups', () => {
    const prompt = `(a dog:0.9) with a (fancy hat:1.1)`;

    basicPromptLexer.reset(prompt);

    const result = Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
    expect(result).toBeTruthy();
  });
  it('should handle wildcards', () => {
    const prompt = `__foo/bar__ __baz__ __foo/bar/baz__`;

    basicPromptLexer.reset(prompt);

    const result = Array.from(basicPromptLexer).map((t) => t.type);
    expect(result.filter((s) => s === 'literal')).toHaveLength(5);
    expect(result).toBeTruthy();
  });

  it('should handle wildcard in groups', () => {
    const prompt = `(__classicArtists__:0.5)`;

    basicPromptLexer.reset(prompt);

    const result = Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
    expect(result).toBeTruthy();
  });

  it('should handle underscores in the middle of wildcards', () => {
    const prompt = `__classic_artists__`;

    basicPromptLexer.reset(prompt);

    const result = Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
    expect(result).toBeTruthy();
  });

  it('should handle a complex prompt with wildcards and weights', () => {
    const prompt = `Epic __EmbPrimeArtists__ [detailed color pencil:photo shoot:0.3] by __fantasyArtist__ and (__classicArtists__:0.5) and (__classicArtists__:0.5), HQ, 8K, hyper detailed, The __female__ surrounded by __dreamyThings__ (face looking __expression__:1.5), __keyword__, __keyword__, __keyword__, __timeOfDay__, timeless realization of the facts of life and our time is limited on this earth, Action, cinematic dramatic lighting, bokeh, shot on Canon 5D,masterpiece [oil painting:hyperrealism:0.3] in the style of (__compositionArtists__:0.5)`;

    basicPromptLexer.reset(prompt);

    const result = Array.from(basicPromptLexer)
      .map((t) => t.type)
      .join(' ');
    expect(result).toBeTruthy();
  });
});
