/**
 * @deprecated Import useColors() from ThemeContext in components.
 * Non-UI modules may import darkColors from ./palettes.
 */
import { darkColors } from './palettes';

export const colors = darkColors;
export type ColorKey = keyof typeof darkColors;
