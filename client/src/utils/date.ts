/**
 * Formats an ISO date string into a readable format (e.g., "Jan 15, 2026").
 * Uses "en-US" locale by default for consistent style across the app.
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString); // Return as string if invalid

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
