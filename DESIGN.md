# Design System - Finbot

## Overview
This document outlines the design tokens, motion system, accessibility guidelines, and component patterns used in Finbot.

---

## Color Tokens

### Theme Variables (CSS Custom Properties)
Colors are defined in `index.css` and accessed via Tailwind as `tg-*`:

- **`--tg-bg`**: Main background color
- **`--tg-card`**: Card/surface background
- **`--tg-secondary`**: Secondary surface (slightly lighter than card)
- **`--tg-text`**: Primary text color
- **`--tg-muted`**: Secondary/muted text
- **`--tg-accent`**: Primary action/accent color (brand)
- **`--tg-gold`**: Gold/secondary accent for financial highlights
- **`--tg-green`**: Success/profit indicator
- **`--tg-red`**: Danger/loss indicator

### Semantic Colors

- **`tg-profit`**: `#4cd964` - Income, gains, positive deltas
- **`tg-loss`**: `#ff5c5c` - Expenses, losses, negative deltas
- **`tg-neutral`**: `#8a92b2` - Muted information, secondary actions

### Theme Presets

- **Obsidian** (default): Dark blue theme
- **Cotton Candy**: Neon pink accent
- **Aurora**: Light theme
- **Forest**: Green-toned dark theme

---

## Spacing Scale

Use these standardized spacing units across all components:

```
xs:   4px   (gap-1, p-1)
sm:   8px   (gap-2, p-2)
md:   12px  (gap-3, p-3)
lg:   16px  (gap-4, p-4)
xl:   24px  (gap-6, p-6)
2xl:  32px  (gap-8, p-8)
```

**Example**: `<div className="p-lg gap-md">` = 16px padding, 12px gaps

---

## Motion & Animation

### Durations

- **fast**: `150ms` - Hover states, quick feedback
- **normal**: `300ms` - Modal open/close, item transitions (default)
- **slow**: `500ms` - Page transitions, hero animations

### Standard Keyframes

- **`fadeIn`**: Opacity from 0 to 1 (300ms ease-out)
- **`slideUp`**: Translate Y from 20px to 0 with fade (400ms)
- **`savings-remove`**: Scale 1→0.9 + fade + collapse (350ms ease-out)

### Easing Functions

- **`ease-out`**: Quick start, slow end (default for exits)
- **`ease-in-out-back`**: Back bounce for playful transitions
- **`ease-out-quad`**: Smooth deceleration

### Accessibility

All animations respect `prefers-reduced-motion` media query. For reduced motion, durations are set to `1ms` and transform animations are disabled.

---

## Typography

### Font Scale

- **H1 (Hero)**: 32px, font-black, leading-tight
- **H2 (Section)**: 24px, font-bold
- **H3 (Subsection)**: 20px, font-semibold
- **Body**: 16px, font-normal (default)
- **Small**: 14px, font-normal
- **XS (Label)**: 12px, font-bold, uppercase, tracking-wider

### Font Family

- **Primary**: `Inter` or system fonts (`-apple-system, BlinkMacSystemFont, etc.`)
- **Mono** (for amounts): `font-mono` (Courier or system monospace)

### Text Variants

```tsx
// Heading
<h1 className="text-6xl font-black text-tg-text tracking-tight">Title</h1>

// Label
<label className="text-xs text-tg-muted font-bold uppercase tracking-wider">Label</label>

// Amount (currency)
<p className="text-lg font-bold font-mono">{amount.toLocaleString()} ₽</p>
```

---

## Border Radius

- **card**: `1.5rem` (24px) - Cards, input fields
- **modal**: `1.875rem` (30px) - Modals and large dialogs
- **small**: `0.5rem` (8px) - Buttons, small components

---

## Shadow System

- **sm-soft**: Light shadow for subtle depth
- **md-soft**: Medium shadow for cards
- **lg-soft**: Large shadow for modals and overlays
- **accent**: Dynamic accent shadow (used for hover effects)

```css
/* Example usage */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
```

---

## Component Patterns

### Button

```tsx
// Primary (CTA)
<button className="bg-tg-accent text-white px-lg py-lg rounded-card font-semibold hover:shadow-lg hover:shadow-tg-accent/30 active:scale-95 transition-all duration-normal">
  Action
</button>

// Secondary
<button className="bg-tg-card border border-white/10 text-tg-text px-lg py-md rounded-card hover:border-white/20 transition-all duration-fast">
  Secondary
</button>

// Icon button
<button className="p-md rounded-lg text-tg-muted hover:text-tg-text hover:bg-white/5 transition-all duration-fast">
  <Icon size={20} />
</button>
```

### Modal

```tsx
// Overlay + Modal structure
<div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center animate-fade-in">
  <div className="bg-tg-card max-w-md w-full p-2xl rounded-modal border border-white/10 shadow-lg animate-slide-up">
    {/* Content */}
  </div>
</div>
```

### Card

```tsx
// Standard card
<div className="bg-tg-card p-lg rounded-card border border-white/5 hover:border-white/10 transition-all duration-fast">
  Content
</div>

// Glass effect
<div className="glass p-lg rounded-card">
  Content
</div>
```

### Input

```tsx
<input 
  className="w-full bg-tg-card text-tg-text p-lg rounded-card border border-white/5 focus:outline-none focus:ring-2 focus:ring-tg-accent/50 placeholder:text-tg-muted/70 transition-all duration-fast"
  placeholder="Placeholder text"
/>
```

---

## Icons

### Icon Sizing

- **16px**: Small buttons, inline labels
- **20px**: Standard button icons
- **24px**: Section headers
- **32px**: Large decorative icons

### Icon Library

Using `lucide-react`:
- Consistent stroke width (2px default)
- 24x24 viewBox for all icons
- Color: inherit from text color, or use semantic colors

---

## Accessibility Guidelines

### Color Contrast

- **Text on background**: Minimum 4.5:1 contrast (WCAG AA)
- **Interactive elements**: Minimum 3:1 contrast
- **Large text** (18px+): Minimum 3:1

### Focus Styles

- Use `focus:ring-2 focus:ring-tg-accent/50` for visible focus indicators
- Never remove default outlines without replacement
- Test with keyboard-only navigation

### ARIA Labels

- All interactive buttons: `aria-label` or visible text
- Modal: `role="dialog"` and `aria-modal="true"`
- Form inputs: `<label>` with `htmlFor` attribute
- Charts: `aria-label` with data summary

### Keyboard Navigation

- **Tab**: Navigate forward through interactive elements
- **Shift+Tab**: Navigate backward
- **Enter**: Activate button or submit form
- **Escape**: Close modal or cancel operation
- **Arrow keys**: Navigate lists or menu items

---

## Responsive Design

### Breakpoints

- **Mobile**: `<375px` - Optimize for small screens (no full-screen modals)
- **Tablet**: `375px - 768px` - Touch-friendly spacing
- **Desktop**: `>768px` - Full layout

### Responsive Patterns

```tsx
// Mobile-first
<div className="text-sm sm:text-base lg:text-lg">

// Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">

// Modal on mobile: rounded bottom only
<div className="rounded-t-modal sm:rounded-modal">
```

---

## Motion Respect

```css
/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

---

## Dark Mode

The app uses CSS custom properties with theme classes. Light theme is available via `:root[data-theme='aurora']`.

To toggle themes:

```tsx
// In settings or root component
document.documentElement.setAttribute('data-theme', 'obsidian');
```

---

## Implementation Example

```tsx
import React from 'react';
import { Plus } from 'lucide-react';

export const ExampleComponent = () => {
  return (
    <div className="space-y-xl p-lg">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-tg-text">Section Title</h2>

      {/* Card */}
      <div className="bg-tg-card p-lg rounded-card border border-white/5 hover:border-white/10 transition-all duration-normal">
        <p className="text-sm text-tg-muted mb-md">Label</p>
        <p className="text-lg font-semibold text-tg-text">1,234,567 ₽</p>
      </div>

      {/* Button */}
      <button className="w-full bg-tg-accent text-white font-semibold py-lg rounded-card hover:shadow-lg active:scale-95 transition-all duration-normal flex items-center justify-center gap-md">
        <Plus size={20} />
        Add Item
      </button>
    </div>
  );
};
```

---

## Changelog

- **v1.0** (Nov 2025): Initial design system with obsidian, spacing scale, motion guidelines, typography, and component patterns.
