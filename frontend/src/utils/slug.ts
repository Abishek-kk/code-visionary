export function extractLeetCodeSlug(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Already a slug
  if (/^[a-z0-9-]+$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/problems\/([a-z0-9-]+)/i);
    if (match) return match[1].toLowerCase();
  } catch {
    // not a URL
  }
  const match = trimmed.match(/problems\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}
