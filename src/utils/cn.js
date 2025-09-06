/**
 * Utility function for merging Tailwind CSS classes
 * Similar to clsx but optimized for Tailwind
 */

export function cn(...inputs) {
  return inputs
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
