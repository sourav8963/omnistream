---
name: OmniStream Aura
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-gap: 12px
---

## Brand & Style

The design system is engineered for high-performance media management, targeting a tech-savvy audience that values speed, precision, and a premium aesthetic. The brand personality is futuristic and efficient, evoking the feeling of a high-end command center for digital assets.

The visual style is **Glassmorphic Modernism**. It leverages depth through translucent layers, vibrant background blurs, and hyper-thin "inner-glow" borders. The interface should feel like light passing through polarized glass, emphasizing a sense of organized complexity that remains intuitive. Every interaction should feel instantaneous, supported by a UI that looks "live" and reactive.

## Colors

This design system utilizes a deep, nocturnal foundation to allow vibrant accents to pop with high luminosity.

- **Primary (Electric Blue):** Used for primary actions, active progress states, and high-priority highlights.
- **Secondary (Neon Purple):** Used for secondary features, category tagging, and aesthetic gradients when paired with the Primary color.
- **Success (Emerald):** Reserved for "Completed" states and verified downloads.
- **Surface Strategy:** Backgrounds are near-black. Components use a semi-transparent slate with a `backdrop-filter: blur(20px)`.
- **Gradients:** Use a linear 135° gradient from Primary to Secondary for "featured" elements or active download bars to indicate energy and movement.

## Typography

The design system uses **Geist** for its entire scale to maintain a technical, monospaced-adjacent clarity while remaining highly readable. 

- **Headers:** Use Bold or SemiBold weights with slightly negative letter-spacing to create a "locked-in" professional look.
- **Data Points:** Use Medium weight for file sizes, speeds, and timestamps to differentiate them from standard body text.
- **Micro-copy:** Use `label-sm` in all-caps for status indicators (e.g., "PENDING", "ENCODING") to mimic technical readouts.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on information density without clutter.

- **Desktop:** 12-column grid. Media cards typically span 3 columns (4 per row) or 4 columns (3 per row) depending on the detail level.
- **Mobile:** Single column with 16px side margins.
- **Rhythm:** An 8px base unit drives all padding and margins. Use "Stack" layouts for lists of downloads with a 12px gap between items to allow the glass effect of each card to remain visible.
- **Safe Areas:** Ensure a 40px padding at the bottom of the viewport for floating transport controls or status bars.

## Elevation & Depth

In this design system, depth is communicated through **translucency and refraction** rather than traditional drop shadows.

- **Level 1 (Base):** The dark background.
- **Level 2 (Cards):** Surface color with 50% opacity, 20px backdrop blur, and a 1px solid border at 10% white opacity.
- **Level 3 (Modals/Popovers):** Surface color with 70% opacity, 40px backdrop blur, and a subtle outer glow using the primary color at 5% opacity.
- **Interactions:** When an item is hovered, the border opacity increases to 30% and the backdrop blur intensifies, making the element appear to "lift" closer to the user.

## Shapes

The design system uses **Rounded** geometry to balance the "hard tech" feel of the typography with a modern, friendly touch.

- **Standard Elements:** 0.5rem (8px) for buttons and input fields.
- **Containers:** 1rem (16px) for media cards and main content areas.
- **Interactive Pill:** Use 3rem (full round) for status badges and tags to distinguish them from functional buttons.
- **Progress Bars:** Fully rounded (pill-shaped) tracks and indicators to signify fluid movement.

## Components

### Buttons
Primary buttons use a solid Electric Blue fill with white text. Secondary buttons use the glass style (translucent background, 1px border). All buttons feature a subtle 400ms transition on hover that increases border brightness.

### Media Cards
Cards feature a high-aspect-ratio thumbnail at the top. The bottom section contains the file name (`body-md`), a secondary-colored progress bar, and metadata (size, format) in `label-sm`.

### Progress Bars
The track is a dark, semi-transparent grey. The indicator is a gradient from `primary` to `secondary`. For active downloads, add a subtle "shimmer" animation that moves across the indicator to signal activity.

### Status Badges
Small, pill-shaped elements. "Downloading" uses an outlined blue style; "Paused" uses an outlined amber; "Error" uses an outlined red.

### Input Fields
Darker than the surface color with 20% opacity. Upon focus, the 1px border transitions to the primary Electric Blue with a faint outer glow (glow spread: 4px).

### Transport Controls
A floating bottom bar using Level 3 elevation. It contains play/pause, cancel, and speed-limiting icons using clean, thin-stroke iconography that matches the weight of the Geist typeface.