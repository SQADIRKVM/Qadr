---
name: Aesthetic of Essentialism
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cfc4c5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#988e90'
  outline-variant: '#4c4546'
  surface-tint: '#c6c6c6'
  primary: '#c6c6c6'
  on-primary: '#303030'
  primary-container: '#000000'
  on-primary-container: '#757575'
  inverse-primary: '#5e5e5e'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#ffb3af'
  on-tertiary: '#68000e'
  tertiary-container: '#000000'
  on-tertiary-container: '#eb002c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#930017'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1200px
---

## Brand & Style

The design system is rooted in a philosophy of technical transparency and functional minimalism. It seeks to strip away the digital noise of the modern web, replacing unnecessary embellishments with raw, structured logic. The target audience consists of tech enthusiasts and professionals who value clarity, intentionality, and a "quiet" interface that respects their focus.

The style is a fusion of **Modern Minimalism** and **Technical Retro-Futurism**. It avoids the trends of glassmorphism and soft shadows in favor of high-contrast silhouettes, dot-matrix patterns, and a tactile, physical quality achieved through geometric precision. The emotional response is one of calm authority—a UI that feels like a precision instrument rather than a consumer toy.

## Colors

The palette is strictly monochromatic to maintain a focused, high-contrast environment. 

- **Backgrounds:** Pure Black (#000000) is the foundation. Surface tiers are built using deep charcoal and slate grays (#1A1A1A, #262626).
- **Foregrounds:** Pure White (#FFFFFF) is used for primary text and high-importance icons. Mid-tone grays are used for secondary information.
- **Accent:** A vibrant, high-saturation Red (#FF0031) is reserved exclusively for critical states: active recording, low battery, destructive actions, or primary notifications. It should be used as a singular "ping" of color in a sea of monochrome.

## Typography

Typography is a primary vehicle for the technical "Nothing" aesthetic.

1.  **Display & Headings:** Use **Space Grotesk**. Its geometric construction and slightly technical letterforms evoke the precision of engineering. Large headings should have tight tracking.
2.  **Body & Utility:** Use **Inter**. It provides the necessary readability and neutrality to balance the expressive nature of the display type. 
3.  **The Dot-Matrix Effect:** For hero sections or data points where a true dot-matrix font is desired, use a custom SVG mask or a dot-pattern overlay on Space Grotesk to simulate a 5x7 LED grid.

## Layout & Spacing

The layout is governed by a **Fixed Grid** system that feels structural and architectural.

- **Grid:** Use a 12-column grid for desktop with 24px gutters. Elements should align strictly to the grid lines to emphasize the "built" nature of the UI.
- **Margins:** Generous outer margins (48px+) are used to create a sense of "quiet" and focus around the central content.
- **Dot-Matrix Grid:** An underlying 8px dot-matrix pattern should be visible in background layers, acting as a guide for all element placement. Every component height and margin should be a multiple of 8.

## Elevation & Depth

This design system rejects traditional shadows and blurs. Depth is communicated through **Tonal Layering** and **Crisp Outlines**.

1.  **Level 0 (Base):** Pure Black (#000000).
2.  **Level 1 (Cards/Surfaces):** Dark Charcoal (#121212) with a 1px solid border of Slate Gray (#262626).
3.  **Level 2 (Popovers/Modals):** Lighter Charcoal (#1A1A1A) with a more prominent border (#404040).

Use "Ghost Borders"—thin, 1px lines—to define boundaries without adding visual weight. To simulate depth, use a subtle 1px offset line (like a hairline highlight) on the top edge of elements.

## Shapes

The shape language is a study in contrasts: **Aggressive Rounding** meeting **Rigid Grids**.

- **Containers:** Large cards and main containers use high-radius corners (24px to 32px). This "squircle-adjacent" look softens the starkness of the black-and-white color palette.
- **Interactive Elements:** Buttons and toggles should be perfectly circular when containing icons, or fully pill-shaped for text buttons. 
- **Icons:** Use thin-stroke, high-contrast icons. Avoid filled icons unless they represent an active/selected state.

## Components

- **Buttons:** Primary buttons are circular or pill-shaped, using solid White with Black text. Secondary buttons are outlined with 1px Slate Gray. Active states trigger a Red (#FF0031) dot next to the label.
- **Chips:** Small, pill-shaped elements with #1A1A1A backgrounds and Inter Medium text. Used for tagging or filtering.
- **Cards:** Defined by a 24px corner radius. On hover, the 1px border should brighten from #262626 to #FFFFFF.
- **Input Fields:** Minimalist underlines or fully rounded containers with a subtle dot-matrix pattern inside the field to indicate where text can be entered.
- **Lists:** Separated by 1px hairlines. Use "dot indicators" (small 4px circles) for bullet points to maintain the technical theme.
- **Specialty Component (The Widget):** Modular, square or rectangular "widgets" with a consistent 24px radius, often containing dot-matrix style data visualizations or weather icons.