---
name: Pure Logic
colors:
  surface: '#f9f9fe'
  surface-dim: '#d9dade'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f8'
  surface-container: '#ededf2'
  surface-container-high: '#e8e8ed'
  surface-container-highest: '#e2e2e7'
  on-surface: '#1a1c1f'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2e3034'
  inverse-on-surface: '#f0f0f5'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5e63'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfe4'
  on-secondary-container: '#626267'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002107'
  on-tertiary-container: '#00993b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1b1f'
  on-secondary-fixed-variant: '#46464b'
  tertiary-fixed: '#72fe88'
  tertiary-fixed-dim: '#53e16f'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#00531c'
  background: '#f9f9fe'
  on-background: '#1a1c1f'
  surface-variant: '#e2e2e7'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system is built on the principles of high-stakes financial clarity and Apple-inspired minimalism. It targets serious poker players who require a dashboard that feels more like a professional trading terminal than a gambling site. The aesthetic is "Pure Minimalist," emphasizing maximum whitespace, a disciplined monochromatic palette, and obsessive attention to alignment. 

The emotional response is one of calm, clinical precision. By removing visual noise—gradients, loud textures, and aggressive betting colors—the UI allows the user to focus entirely on equity, pot odds, and bankroll management. The interface uses a "Quiet Professional" approach, where the data is the hero and the container is nearly invisible.

## Colors
The palette is strictly functional. The foundation is a pure white (`#FFFFFF`) background to ensure maximum contrast and a sense of "infinite" canvas.

- **Primary:** Pure black is reserved for critical text and primary actions to ensure high legibility.
- **Secondary:** System Gray is used for secondary information, borders, and disabled states.
- **Tertiary:** A refined Green is used exclusively for positive financial movement (wins, profit, positive EV).
- **Accents:** A subtle Red (`#FF3B30`) is used only for losses or negative trends.
- **Surface:** The neutral hex is utilized for subtle card backgrounds or "well" containers to separate data groups from the main background.

## Typography
This design system utilizes **Plus Jakarta Sans** as a modern, rounded alternative to SF Pro Rounded, maintaining that friendly yet technical geometric feel. 

- **Numerical Data:** For chip counts, pot sizes, and ROI, use a monospaced font (JetBrains Mono) to ensure numbers align perfectly in tables and vertical lists.
- **Hierarchy:** Use font weight rather than color to establish hierarchy. Primary headers are Semibold/Bold; secondary labels are Regular but in System Gray.
- **Legibility:** Maintain generous line height for body text to ensure multi-line hand histories are readable at a glance.

## Layout & Spacing
The layout follows a strict 8px grid system. The dashboard uses a **Fixed Grid** approach for the main content area (centered, 1200px max width) to maintain a premium "application" feel rather than a stretched website.

- **Desktop:** 12-column grid with 24px gutters. Sidebars are fixed at 280px.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px margins. Content flows vertically; complex data tables should horizontal-scroll within cards.
- **Negative Space:** Use "lg" (40px) spacing between distinct content sections to prevent the dashboard from feeling cluttered.

## Elevation & Depth
Depth is created through **Ambient Shadows** and tonal layering rather than heavy borders.

- **Base Layer:** Pure White (`#FFFFFF`).
- **Surface Layer (Cards):** Pure White with a very soft, high-diffusion shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Active State:** Elements being interacted with (like a selected hand or active table) may use a subtle 1px border in System Gray 4 (`#D1D1D6`) to distinguish them.
- **Overlays:** Modals and dropdowns use a 20px backdrop blur (Glassmorphism) with a 60% white fill to maintain the "Pure" aesthetic while providing context.

## Shapes
In alignment with the "Rounded" aesthetic, the design system avoids sharp corners. 

- **Cards & Primary Containers:** Use `rounded-lg` (16px) to create a soft, approachable frame for complex data.
- **Buttons & Inputs:** Use `rounded-md` (8px) for a precise, modern look.
- **Tags & Status Badges:** Use "Pill" shapes (Full Rounding) to differentiate them from interactive buttons.
- **Icons:** Use SF Symbols where possible, or high-quality Emojis for suit symbols (♠️, ♥️, ♦️, ♣️) to provide a familiar, tactile reference.

## Components
- **Buttons:** Primary buttons are solid black with white text. Secondary buttons are subtle gray ghost buttons. All buttons have a subtle "press" animation (scale 0.98).
- **Cards:** White background, 16px corner radius, and the signature ambient shadow. Header areas within cards should have a thin 1px bottom divider in `#F2F2F7`.
- **Data Tables:** Row-based with no vertical borders. Use "Zebra striping" only on hover to maintain the clean white look.
- **Hand Visualizers:** Use small, rounded rectangles for cards. The suit icons (Emojis) should be centered and legible.
- **Inputs:** Simple outlines in System Gray. On focus, the border thickens slightly to 2px black.
- **Chips/Badges:** Small, pill-shaped markers for "In Position," "Dealer," or "Winner" states, using low-saturation background tints (e.g., very pale green for "Winner").