import { describe, expect, it } from 'vitest';
import {
  constructBound,
  constructLiteral,
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
      console.log({ bound, selections });
      expect(selections.length).toBe(3);
    });
  });
});
