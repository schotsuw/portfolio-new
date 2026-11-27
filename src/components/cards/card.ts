/** Shared card surface. Width is fluid; height comes from content, aspect ratio or min-height. */
export const cardClass = 'rounded-[24px] bg-card p-6 text-ink'

/** Focus ring for cards that are links. */
export const cardLinkClass =
  'block outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]'

/**
 * Stretched link for cards whose title is the link: the link names itself by its own text
 * (WCAG 2.5.3 label-in-name), while its ::after covers the whole card so any click, middle-click
 * or focus ring applies to the card. The card root must be `relative`.
 */
export const stretchedLinkClass =
  'outline-none after:absolute after:inset-0 after:rounded-[24px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus-ring)]'
