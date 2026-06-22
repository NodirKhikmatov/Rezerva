import {
  buildReferenceCode,
  parseReferenceCodeYear,
} from './reference-code.util';

describe('reference-code.util', () => {
  it('builds reference code with six-digit sequence', () => {
    expect(buildReferenceCode(2026, 4821)).toBe('RZ-2026-004821');
  });

  it('parses year from reference code', () => {
    expect(parseReferenceCodeYear('RZ-2026-004821')).toBe(2026);
    expect(parseReferenceCodeYear('invalid')).toBeNull();
  });
});
