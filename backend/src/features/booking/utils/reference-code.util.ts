export function buildReferenceCode(year: number, sequence: number): string {
  const padded = String(sequence).padStart(6, '0');
  return `RZ-${year}-${padded}`;
}

export function parseReferenceCodeYear(referenceCode: string): number | null {
  const match = /^RZ-(\d{4})-\d{6}$/.exec(referenceCode);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}
