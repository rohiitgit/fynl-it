# Design Tokens Documentation

This document outlines the design system tokens used throughout Fynl-It (Nudgr). All tokens are defined using OKLCH color space for better perceptual uniformity and accessibility.

## Color System

### Primary Brand Colors

#### Green (Success/Primary)
- **Usage**: Primary brand color, success states, CTAs, paid invoices
- **Light Mode Base**: `oklch(0.55 0.16 142)` - `#22C55E` equivalent
- **Dark Mode Base**: `oklch(0.65 0.17 142)` - Brighter for dark backgrounds

**Full Scale**:
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `green-50` | `oklch(0.97 0.02 142)` | `oklch(0.13 0.006 142)` | Lightest background tint |
| `green-100` | `oklch(0.92 0.05 142)` | `oklch(0.18 0.008 142)` | Light hover state |
| `green-200` | `oklch(0.85 0.08 142)` | `oklch(0.25 0.010 142)` | Light card background |
| `green-300` | `oklch(0.75 0.12 142)` | `oklch(0.35 0.012 142)` | Secondary shade |
| `green-400` | `oklch(0.64 0.17 142)` | `oklch(0.55 0.15 142)` | Gradient variant |
| `green-500` | `oklch(0.55 0.16 142)` | `oklch(0.65 0.17 142)` | **PRIMARY BRAND** |
| `green-600` | `oklch(0.45 0.15 142)` | `oklch(0.75 0.18 142)` | Dark/hover states |
| `green-700` | `oklch(0.35 0.13 142)` | `oklch(0.82 0.16 142)` | Darker variant |
| `green-800` | `oklch(0.25 0.10 142)` | `oklch(0.88 0.12 142)` | Very dark |
| `green-900` | `oklch(0.18 0.08 142)` | `oklch(0.93 0.08 142)` | Darkest |

#### Blue (Informational)
- **Usage**: Info states, notifications, hyperlinks, informational badges
- **Light Mode Base**: `oklch(0.55 0.15 220)` - PayPal-inspired
- **Dark Mode Base**: `oklch(0.68 0.15 220)`

**Full Scale**:
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `blue-50` | `oklch(0.97 0.02 220)` | `oklch(0.13 0.006 220)` | Info backgrounds |
| `blue-100` | `oklch(0.92 0.05 220)` | `oklch(0.18 0.008 220)` | Hover states |
| `blue-200` | `oklch(0.85 0.08 220)` | `oklch(0.25 0.010 220)` | Borders |
| `blue-300` | `oklch(0.75 0.12 220)` | `oklch(0.35 0.012 220)` | Active states |
| `blue-400` | `oklch(0.64 0.14 220)` | `oklch(0.55 0.13 220)` | Secondary |
| `blue-500` | `oklch(0.55 0.15 220)` | `oklch(0.68 0.15 220)` | **INFO BASE** |
| `blue-600` | `oklch(0.45 0.13 220)` | `oklch(0.78 0.14 220)` | Dark variant |
| `blue-700` | `oklch(0.35 0.11 220)` | `oklch(0.85 0.12 220)` | Darker |
| `blue-800` | `oklch(0.25 0.08 220)` | `oklch(0.90 0.09 220)` | Very dark |
| `blue-900` | `oklch(0.18 0.06 220)` | `oklch(0.95 0.06 220)` | Darkest |

#### Purple (Premium Features)
- **Usage**: Premium features, upsells, special badges, pro features
- **Light Mode Base**: `oklch(0.55 0.14 280)`
- **Dark Mode Base**: `oklch(0.70 0.14 280)`

**Full Scale**:
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `purple-50` | `oklch(0.97 0.02 280)` | `oklch(0.13 0.006 280)` | Premium backgrounds |
| `purple-100` | `oklch(0.92 0.05 280)` | `oklch(0.18 0.008 280)` | Hover states |
| `purple-200` | `oklch(0.85 0.08 280)` | `oklch(0.25 0.010 280)` | Borders |
| `purple-300` | `oklch(0.75 0.10 280)` | `oklch(0.35 0.012 280)` | Active |
| `purple-400` | `oklch(0.64 0.12 280)` | `oklch(0.55 0.12 280)` | Secondary |
| `purple-500` | `oklch(0.55 0.14 280)` | `oklch(0.70 0.14 280)` | **PREMIUM BASE** |
| `purple-600` | `oklch(0.45 0.12 280)` | `oklch(0.78 0.13 280)` | Dark |
| `purple-700` | `oklch(0.35 0.10 280)` | `oklch(0.85 0.11 280)` | Darker |
| `purple-800` | `oklch(0.25 0.08 280)` | `oklch(0.90 0.08 280)` | Very dark |
| `purple-900` | `oklch(0.18 0.06 280)` | `oklch(0.95 0.06 280)` | Darkest |

### Status Colors

#### Success (Green)
- **Token**: `--success`
- **Light**: `oklch(0.45 0.15 142)`
- **Dark**: `oklch(0.65 0.17 142)`
- **Contrast**: WCAG AA (4.5:1 minimum)

#### Warning (Orange)
- **Token**: `--warning`
- **Light**: `oklch(0.65 0.18 85)`
- **Dark**: `oklch(0.75 0.18 85)`
- **Usage**: Pending invoices, caution states

#### Destructive (Red)
- **Token**: `--destructive`
- **Light**: `oklch(0.55 0.24 27)`
- **Dark**: `oklch(0.68 0.20 27)`
- **Usage**: Overdue invoices, errors, delete actions

#### Info (Blue)
- **Token**: `--info`
- **Light**: `oklch(0.55 0.15 220)`
- **Dark**: `oklch(0.68 0.15 220)`
- **Usage**: Informational messages, tips

#### Premium (Purple)
- **Token**: `--premium`
- **Light**: `oklch(0.55 0.14 280)`
- **Dark**: `oklch(0.70 0.14 280)`
- **Usage**: Premium features, upgrades

### Neutral Gray Scale

**10-grade scale** following USWDS/Atlassian model:

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `gray-0` | `oklch(1.0 0 0)` | `oklch(0.0 0 0)` | Pure white / Pure black |
| `gray-5` | `oklch(0.98 0 0)` | `oklch(0.08 0 0)` | Subtle backgrounds |
| `gray-10` | `oklch(0.95 0 0)` | `oklch(0.15 0 0)` | Off-white / Off-black |
| `gray-20` | `oklch(0.90 0 0)` | `oklch(0.22 0 0)` | Light backgrounds |
| `gray-30` | `oklch(0.82 0 0)` | `oklch(0.30 0 0)` | Borders |
| `gray-40` | `oklch(0.72 0 0)` | `oklch(0.40 0 0)` | Disabled text |
| `gray-50` | `oklch(0.60 0 0)` | `oklch(0.50 0 0)` | **AA contrast pivot** |
| `gray-60` | `oklch(0.48 0 0)` | `oklch(0.60 0 0)` | Secondary text |
| `gray-70` | `oklch(0.38 0 0)` | `oklch(0.72 0 0)` | Primary text |
| `gray-80` | `oklch(0.28 0 0)` | `oklch(0.82 0 0)` | Dark text |
| `gray-90` | `oklch(0.18 0 0)` | `oklch(0.90 0 0)` | Darkest text |
| `gray-100` | `oklch(0.0 0 0)` | `oklch(1.0 0 0)` | Pure black / Pure white |

**Note**: Gray-50 provides AA contrast (4.5:1) against both white (gray-0) and black (gray-100).

### Semantic Tokens

| Token | Purpose | Light Mode | Dark Mode |
|-------|---------|-----------|-----------|
| `--background` | Page background | `oklch(0.99 0.002 142)` | `oklch(0.13 0.006 142)` |
| `--foreground` | Primary text | `oklch(0.16 0.004 142)` | `oklch(0.95 0.002 142)` |
| `--card` | Card backgrounds | `oklch(0.98 0.003 142)` | `oklch(0.18 0.008 142)` |
| `--border` | Border colors | `oklch(0.85 0.012 142)` | `oklch(0.30 0.012 142)` |
| `--input` | Input backgrounds | `oklch(0.92 0.008 142)` | `oklch(0.25 0.010 142)` |
| `--ring` | Focus ring | `oklch(0.45 0.15 142)` | `oklch(0.65 0.17 142)` |
| `--muted` | Muted backgrounds | `oklch(0.92 0.008 142)` | `oklch(0.22 0.010 142)` |
| `--muted-foreground` | Muted text | `oklch(0.48 0.02 142)` | `oklch(0.70 0.015 142)` |

---

## Typography System

### Font Stacks
- **Sans-serif**: Inter (via `--font-geist-sans`)
- **Monospace**: Geist Mono (via `--font-geist-mono`)

### Type Scale

| Element | Size Range | Line Height | Weight | Usage |
|---------|-----------|-------------|--------|-------|
| `h1` | 28px → 40px | 1.2 | 700 | Page titles |
| `h2` | 24px → 32px | 1.3 | 600 | Section headers |
| `h3` | 20px → 24px | 1.3 | 600 | Subsection headers |
| `h4` | 18px → 20px | 1.4 | 500 | Card titles |
| `h5` | 16px → 18px | 1.4 | 500 | Small headers |
| `h6` | 14px → 16px | 1.5 | 500 | Micro headers |
| `body` | 17px → 18px | 1.5 | 400 | Default body text |
| `.body-lg` | 18px | 1.56 | 400 | Large body text |
| `.body-sm` | 14px | 1.43 | 400 | Small body text |
| `.label` | 14px | 1.43 | 500 | Form labels |
| `.caption` | 12px | 1.33 | 400 | Image captions, meta |
| `.overline` | 12px | 2 | 600 | Section labels (uppercase) |
| `small` | 12px | 1.33 | 400 | Legal, fine print |

**Fluid Typography**: All headings use `clamp()` for responsive scaling based on viewport width.

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

**Best Practice**: Limit to 3-5 weights per page for performance and visual clarity.

---

## Spacing System

### Base Unit
**8px** - Following Material Design and industry standards

### Tailwind Default Scale
Fynl-It uses Tailwind CSS v4's default spacing scale with a 0.25rem (4px) base unit.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `0` | 0 | 0px | No spacing |
| `0.5` | 0.125rem | 2px | Micro spacing |
| `1` | 0.25rem | 4px | Extra tight |
| `2` | 0.5rem | 8px | Tight |
| `3` | 0.75rem | 12px | Base tight |
| `4` | 1rem | 16px | **Base spacing** |
| `5` | 1.25rem | 20px | Loose |
| `6` | 1.5rem | 24px | Extra loose |
| `8` | 2rem | 32px | Section spacing |
| `10` | 2.5rem | 40px | Large sections |
| `12` | 3rem | 48px | Component spacing |
| `16` | 4rem | 64px | Major sections |
| `20` | 5rem | 80px | Layout spacing |
| `24` | 6rem | 96px | Large layout |

### Custom Spacing Tokens

Can be defined in Tailwind v4 via `@theme`:

```css
@theme {
  --spacing-tight: 0.5rem;    /* 8px */
  --spacing-base: 1rem;       /* 16px */
  --spacing-loose: 1.5rem;    /* 24px */
}
```

### Usage Guidelines

**Compact UI** (Mobile, dense data):
- Use `space-2` (8px) to `space-4` (16px)
- Example: Form fields, list items, compact cards

**Medium UI** (Default desktop):
- Use `space-4` (16px) to `space-8` (32px)
- Example: Card padding, section margins

**Spacious UI** (Landing pages, hero sections):
- Use `space-12` (48px) to `space-24` (96px)
- Example: Section spacing, hero padding

**Consistent Patterns**:
```tsx
// Card padding
px-6 py-4 sm:px-6 lg:px-8

// Section spacing
space-y-4 sm:space-y-6 lg:gap-8

// Button padding
px-4 py-2 sm:px-6 sm:py-3
```

---

## Border Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements (badges, pills) |
| `--radius-md` | 8px | Medium elements (inputs) |
| `--radius-lg` | 10px | Large elements (cards, modals) |
| `--radius-xl` | 14px | Extra large (hero cards) |
| `--radius` | 10px | Default base radius |

**Formula**:
```css
--radius: 0.625rem; /* 10px base */
--radius-sm: calc(var(--radius) - 4px);  /* 6px */
--radius-md: calc(var(--radius) - 2px);  /* 8px */
--radius-lg: var(--radius);              /* 10px */
--radius-xl: calc(var(--radius) + 4px);  /* 14px */
```

---

## Animation & Motion

### Duration Standards
- **Quick**: 150-200ms - Hover states, toggles
- **Standard**: 300-400ms - Modals, dropdowns, page transitions
- **Slow**: 500ms+ - Complex animations (use sparingly)

**Best Practice**: Keep animations under 400ms for fintech credibility.

### Easing Curves

| Name | Curve | Usage |
|------|-------|-------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Most interactions (default) |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Element transitions |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |

### Animation Library

#### Keyframe Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `fade-in` | 300ms | ease-out | Simple fades |
| `slide-up` | 400ms | ease-smooth | Cards entering |
| `slide-down` | 400ms | ease-smooth | Dropdowns |
| `scale-in` | 300ms | ease-smooth | Modals |
| `shimmer` | 2s | linear | Loading skeleton |
| `processing-pulse` | 1.5s | ease-in-out | Payment processing |
| `success-checkmark` | 400ms | ease-smooth | Success states |
| `slide-in-right` | 400ms | ease-smooth | Toast notifications |
| `slide-in-left` | 400ms | ease-smooth | Sidebars |

#### Utility Classes

```css
.animate-fade-in          /* Fade in on mount */
.animate-slide-up         /* Slide up from bottom */
.animate-slide-down       /* Slide down from top */
.animate-scale-in         /* Scale from 95% to 100% */
.animate-shimmer          /* Skeleton loading effect */
.animate-pulse            /* Payment processing indicator */
.animate-slide-in-right   /* Slide from right (toasts) */
.animate-slide-in-left    /* Slide from left (nav) */
```

### Performance Optimizations

```css
/* GPU acceleration */
.transform-gpu {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Will-change hints */
.interactive-card {
  will-change: transform, box-shadow;
}
```

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### Focus States
- **Focus ring**: 2px solid, `--ring` color
- **Offset**: 2px
- **Border radius**: 2px

### Contrast Requirements
- **WCAG AA**: 4.5:1 for normal text, 3:1 for large text
- **WCAG AAA**: 7:1 for normal text, 4.5:1 for large text

All color tokens maintain **WCAG AA** minimum.

### Colorblind Accessibility

Pattern utilities for non-color differentiation:

```css
.pattern-dots       /* Dotted pattern overlay */
.pattern-diagonal   /* Diagonal stripes */
```

**Usage**: Apply to status badges alongside color for redundancy.

---

## Component-Specific Tokens

### Invoice Status Badges

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Paid | `green-50` | `green-700` | `green-200` |
| Pending | `orange-50` | `orange-700` | `orange-200` |
| Overdue | `red-50` | `red-700` | `red-200` |

Dark mode uses `/{opacity}` variants (e.g., `green-500/20`).

### Buttons

| Variant | Background | Hover | Active |
|---------|-----------|-------|--------|
| Primary | `green-500` | `green-600` | Lift + shadow |
| Secondary | `gray-10` | `gray-20` | Scale down |
| Destructive | `destructive` | `destructive/90` | Lift |
| Ghost | `transparent` | `accent` | — |
| Outline | `transparent` | `accent` | Border |

### Cards

- **Background**: `--card` with gradient `from-card to-card/50`
- **Border**: `--border/50` (subtle)
- **Hover**: Enhanced shadow with green tint `shadow-green-500/20`
- **Padding**: Mobile `p-4`, Desktop `p-6`

---

## Usage Examples

### Color

```tsx
// Status badge
<Badge className="bg-green-50 text-green-700 border-green-200">
  Paid
</Badge>

// Info notification
<div className="bg-blue-50 border-l-4 border-blue-500 p-4">
  <p className="text-blue-700">Informational message</p>
</div>

// Premium badge
<Badge className="bg-purple-50 text-purple-700 border-purple-200">
  Pro
</Badge>
```

### Typography

```tsx
// Headings
<h1>Invoice Management</h1>
<h2>Recent Activity</h2>
<h3>Payment Details</h3>

// Body variants
<p className="body-lg">Large introduction text</p>
<p>Default body text</p>
<p className="body-sm">Fine print or meta info</p>

// Utility text
<span className="label">Form Label</span>
<span className="caption">Image caption or metadata</span>
<span className="overline">Section Label</span>
```

### Spacing

```tsx
// Card with responsive spacing
<Card className="p-4 sm:p-6 lg:p-8 space-y-4">
  <CardHeader className="space-y-2">
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>

// Layout sections
<section className="space-y-8 sm:space-y-12 lg:space-y-16">
  {/* Content */}
</section>
```

### Animation

```tsx
// Fade in on mount
<div className="animate-fade-in">
  <InvoiceCard />
</div>

// Slide up for modals
<Dialog className="animate-scale-in">
  {/* Content */}
</Dialog>

// Skeleton loader
<div className="h-20 bg-gradient-to-r from-gray-10 via-gray-20 to-gray-10
                animate-shimmer bg-[length:200%_100%]">
</div>
```

---

## References

- **Color Space**: [OKLCH Color Space Guide](https://oklch.org/)
- **Tailwind CSS v4**: [Tailwind Documentation](https://tailwindcss.com/docs)
- **Accessibility**: [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **shadcn/ui**: [Component Library](https://ui.shadcn.com/)

---

**Last Updated**: 2025-01-23
**Maintained by**: Fynl-It Design Team
