/** Display initials from a display name, email local-part, or settings name. */
export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function userDisplayLabel(
  displayName?: string | null,
  email?: string | null,
  fallback = 'Account',
): string {
  return displayName?.trim() || email?.split('@')[0] || fallback;
}
