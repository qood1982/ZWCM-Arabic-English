/**
 * Extract the area/location code from a functional location string.
 * e.g. "AA-BB-CC-DD" → "CC"
 */
export const getLocationCode = (functionalLocation: string): string => {
  const parts = functionalLocation?.split('-') || [];
  return parts[2] || functionalLocation || '';
};
