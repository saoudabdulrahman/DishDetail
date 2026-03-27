export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Preserve original value when parsing fails so UI still renders something.
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
