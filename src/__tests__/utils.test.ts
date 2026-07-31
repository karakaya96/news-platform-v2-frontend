import { describe, expect, it } from 'vitest';
import { truncateText } from '@/lib/utils';

describe('utils', () => {
  describe('truncateText', () => {
    it('returns original text if shorter than maxLength', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('truncates text and adds ellipsis', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello Wo...');
    });

    it('handles empty string', () => {
      expect(truncateText('', 5)).toBe('');
    });

    it('handles exact length', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });
  });
});
