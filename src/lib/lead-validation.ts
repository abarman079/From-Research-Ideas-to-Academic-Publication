/** Browser-safe utilities; kept distinct from the server-only Supabase module. */
export const leadSources = ['nav', 'feature', 'finale', 'book-back-cover', 'direct'] as const;
export type LeadSource = (typeof leadSources)[number];
export function parseLeadSource(input: unknown): LeadSource {
  return typeof input === 'string' && leadSources.includes(input as LeadSource) ? input as LeadSource : 'direct';
}
export function asciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, char => String('০১২৩৪৫৬৭৮৯'.indexOf(char)));
}
