import { describe, expect, it } from 'vitest';
import {
  constructBound,
  constructLiteral,
  constructVariable,
  constructVariants,
  generateDefaultSelection,
} from './parse_utils';

describe('parse_utils', () => {
  describe('bounds', () => {
    it('empty case', () => {
      const actual = constructBound([{ value: '' }]);
      expect(actual.min).toBe(1);
      expect(actual.max).toBe(1);
      expect(actual.separator).toBe(',');
    });

    it('min only', () => {
      const actual = constructBound([{ value: '3$$' }]);
      expect(actual.min).toBe(3);
      expect(actual.max).toBe(3);
      expect(actual.separator).toBe(',');
    });

    it('min- omit', () => {
      const actual = constructBound([{ value: '3-$$' }]);
      expect(actual.min).toBe(3);
      expect(actual.max).toBe(-1);
      expect(actual.separator).toBe(',');
    });

    it('max only', () => {
      const actual = constructBound([{ value: '-3$$' }]);
      expect(actual.min).toBe(1);
      expect(actual.max).toBe(3);
      expect(actual.separator).toBe(',');
    });
  });

  describe('separator', () => {
    it('empty case', () => {
      const actual = constructBound([{ value: '$$$$' }]);
      expect(actual.separator).toBe('');
    });
    it('a word', () => {
      const actual = constructBound([{ value: '$$ and $$' }]);
      expect(actual.separator).toBe(' and ');
    });
    it('something with a dollar sign', () => {
      const actual = constructBound([{ value: '$$ -$- $$' }]);
      expect(actual.separator).toBe(' -$- ');
    });
  });

  describe('defaultSelection', () => {
    it('min only', () => {
      const bound = constructBound([{ value: '3$$' }]);
      const chunks = [
        constructLiteral('Alfa'),
        constructLiteral('Bravo'),
        constructLiteral('Charlie'),
        constructLiteral('Delta'),
        constructLiteral('Echo'),
        constructLiteral('Foxtrot'),
      ];
      const selections = generateDefaultSelection(bound, chunks);
      expect(selections.length).toBe(3);
    });
  });

  describe('variables', () => {
    it('construction (access)', () => {
      const data = ['${', 'foo', undefined, '}'];
      const actual = constructVariable(data);
      expect(actual.flavor).toBe('access');
      expect(actual.value).toBe(undefined);
    });
    it('construction (access with default)', () => {
      const data = ['${', 'foo', [{ text: ':' }, 'bar'], '}'];
      const actual = constructVariable(data);
      expect(actual.flavor).toBe('access');
      expect(actual.value).toContain('bar');
    });
    it('construction (assignment)', () => {
      const data = ['${', 'foo', [{ text: '=' }, 'bar'], '}'];
      const actual = constructVariable(data);
      expect(actual.flavor).toBe('assignment');
      expect(actual.value).toBe('bar');
    });
    it('construction (assignment immediate)', () => {
      const data = ['${', 'foo', [{ text: '=!' }, 'bar'], '}'];
      const actual = constructVariable(data);
      expect(actual.flavor).toBe('assignmentImmediate');
    });
    it('construction (assignment immediate variants)', () => {
      const data = [
        '${',
        'foo',
        [
          { text: '=!' },
          [
            [
              constructVariants([
                undefined,
                undefined,
                [
                  constructLiteral('alfa'),
                  constructLiteral('bravo'),
                  constructLiteral('charlie'),
                ],
              ]),
            ],
          ],
        ],
        '}',
      ];
      const actual = constructVariable(data);
      expect(actual.flavor).toBe('assignmentImmediate');
      expect(actual.value?.[0]?.[0]?.type).toBe('variants');
    });
  });
});
