# CSS / SCSS Rules

Load this file only for CSS/SCSS work or style review.

- Use existing SCSS variables for colors and spacing when available.
- Use spacing and dimensions in four-pixel increments.
- Global utilities live in `src/theme` (loaded by `src/global.scss`): spacing `.m-*`/`.p-*`/`.gap-*`
  (0.25rem steps), `.font-<px>`, `.fw-<weight>`, `.lh-<tenths>`, `.w-<px>`/`.h-<px>`/`.w-full`,
  flex/truncate helpers, colour utilities on Ionic variables and the neutral `--app-*` tokens.
- Colours go through Ionic variables or the `--app-*` tokens in `src/theme/variables.scss`; no hex
  literals in components.
- When reviewing SCSS, compare changed component/page SCSS/CSS against existing global utilities, especially in `src/theme`.
- Apply safe one-to-one utility replacements directly in reviewed files.
- Prefer existing utilities for font, spacing, sizing, flex, truncate, and divider styles.
- Keep component/page CSS/SCSS only for genuinely component-specific styles.
- Always try to move global styles to global files and classes.
- for SCSS try to use nesting when possible.
