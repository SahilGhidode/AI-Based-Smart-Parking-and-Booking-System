# Dark Mode & GSAP Animations Guide

## Overview
This document outlines the dark mode toggle and GSAP animations implemented in the SmartPark application.

---

## Dark Mode Implementation

### Theme Provider Setup
The theme system uses `next-themes` with the following configuration:
- **Default Theme**: Light mode
- **System Detection**: Enabled (respects system preferences)
- **Attribute**: `class` (applies `.dark` class to `<html>`)

### Components with Dark Mode Support

#### 1. **ThemeToggle Component** (`/components/ThemeToggle.tsx`)
A beautiful animated button in the navigation bar that toggles between light and dark modes.

**Features:**
- Sun/Moon icon swap with 3D rotation effect
- 360° button rotation on click
- Smooth transitions with GSAP
- Loading state with skeleton loader

**Usage:**
```tsx
<ThemeToggle />
```

#### 2. **Navigation Component** (`/components/Navigation.tsx`)
Updated with:
- Dark mode styling for all elements
- Theme-aware dropdown menus
- Dark mode button styling
- Language selector dark mode support

#### 3. **Page Layouts**
All pages include:
- `dark:bg-slate-950` for dark backgrounds
- `dark:text-slate-50` for dark text
- `dark:border-slate-700` for dark borders
- Smooth color transitions with `transition-colors duration-500`

---

## GSAP Animation Components

### 1. **ThemeToggle Animations** (`/components/ThemeToggle.tsx`)
When toggling theme:
```javascript
// Button rotation
gsap.to(toggleRef.current, {
  rotation: 360,
  duration: 0.6,
  ease: "back.out",
})

// Icon flip animation
gsap.fromTo(sunRef.current, 
  { opacity: 1, scale: 1, rotateY: 0 },
  { opacity: 0, scale: 0.5, rotateY: 180, duration: 0.4 }
)
```

### 2. **Navigation Animations** (`/components/Navigation.tsx`)
- **Entrance Animation**: Navigation slides down from top with `y: -100` to `y: 0`
- **Menu Items Stagger**: Each menu item fades in with 0.1s stagger delay
- **Mobile Menu Collapse**: Smooth height animation when toggling mobile menu
- **Dropdown Menu**: Scale and opacity animation on open/close

```javascript
gsap.from(navRef.current, {
  y: -100,
  opacity: 0,
  duration: 0.8,
  ease: "back.out",
})
```

### 3. **AnimatedHero Component** (`/components/AnimatedHero.tsx`)
Large hero section with multiple animation effects:

**Letter-by-letter Title Animation:**
- Each character staggered with 0.05s delay
- Opacity and Y translation animation
- Total duration: 0.8s

**Subtitle Fade-in:**
- Delayed by 0.4s after title starts
- Smooth opacity and Y translation

**Button Animations:**
- Staggered 0.1s apart
- Delayed 0.6s from animation start

**Background Floating Effect:**
- Continuous float animation (6s loop)
- Y-axis translation of ±20px
- Sine easing for smooth motion

**Parallax Scroll:**
- Changes opacity and Y position while scrolling
- `scrub: 1` for smooth scroll-linked animation

### 4. **AnimatedCards Component** (`/components/AnimatedCards.tsx`)
Reusable card components with animations:

**Individual Card Animation:**
```javascript
gsap.from(cardRef.current, {
  opacity: 0,
  y: 30,
  duration: 0.6,
  delay: delay,
  ease: "power3.out",
})
```

**Hover Effects:**
- Y translation: -10px
- Shadow enhancement
- 0.3s transition duration

**Grid Container:**
- Fade-in animation when scrolling into view
- Uses ScrollTrigger for visibility detection

### 5. **ScrollAnimations Component** (`/components/ScrollAnimations.tsx`)
Global scroll-triggered animations with multiple animation types:

**Animation Types:**
- `data-animate="fade-in"`: Simple opacity animation
- `data-animate="slide-up"`: Fade + Y translation
- `data-animate="slide-left"`: Fade + X translation (negative)
- `data-animate="slide-right"`: Fade + X translation (positive)
- `data-animate="scale"`: Scale from 0.8 to 1
- `data-animate="rotate"`: Rotation + scale combo

**Usage in HTML:**
```html
<div data-animate="slide-up">Content</div>
<div data-animate="fade-in">Another section</div>
```

---

## CSS Animations (globals.css)

### Keyframe Animations
All animations are defined in `/app/globals.css`:

1. **fadeIn / fadeOut** - Opacity changes
2. **slideLeft / slideRight** - Horizontal translation
3. **slideUp / slideDown** - Vertical translation
4. **scaleIn** - Scale from 0.9 to 1
5. **float** - Vertical floating motion
6. **rotateIn** - Rotation + scale combo
7. **pulseGlow** - Opacity pulsing

### Utility Classes
Available Tailwind utility classes:
```css
.animate-fade-in
.animate-fade-out
.animate-slide-left
.animate-slide-right
.animate-slide-down
.animate-slide-up
.animate-scale-in
.animate-float
.animate-rotate-in
.animate-pulse-glow
```

---

## Integration Points

### Home Page (`/app/page.tsx`)
- ScrollAnimations component for scroll-triggered effects
- Dark mode styling on all sections
- Feature cards with hover animations
- Hero section with slide animations

### Navigation Bar
- Theme toggle button with GSAP animations
- Mobile menu with smooth collapse/expand
- Dropdown menu animations
- Dark mode support throughout

---

## Performance Notes

1. **GSAP Performance**: 
   - Uses `gsap.context()` for automatic cleanup
   - ScrollTrigger is properly registered and killed to prevent memory leaks
   - Animations use GPU-accelerated transforms (transform, opacity)

2. **CSS Transitions**:
   - Background and text colors transition smoothly
   - Duration: 500ms for visible changes
   - `color-scheme` property respects theme

3. **Dark Mode Efficiency**:
   - Uses CSS custom properties for color values
   - Minimal runtime overhead
   - Next-themes handles persistence automatically

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- System preference detection via `prefers-color-scheme`
- CSS Grid, Flexbox, and CSS custom properties required
- GSAP supports all modern browsers

---

## Customization

### Adjusting Animation Timings
Edit animation durations in:
1. GSAP animations: `duration: X`
2. CSS animations: `animation: name Xs ease`
3. Transition durations: `duration-{ms}`

### Adding New Animations
1. Create keyframes in `globals.css`
2. Add utility class in `@layer utilities`
3. Use in components or HTML with `data-animate` attribute

### Dark Mode Colors
Modify theme colors in:
- `globals.css`: CSS custom properties (--background, --foreground, etc.)
- Component classes: `dark:bg-slate-950`, `dark:text-slate-50`, etc.

---

## Files Modified

1. `/app/providers.tsx` - Added ThemeProvider
2. `/app/layout.tsx` - Added suppressHydrationWarning and dark mode classes
3. `/app/globals.css` - Added animations and dark mode transitions
4. `/app/page.tsx` - Added animation imports and data-animate attributes
5. `/components/Navigation.tsx` - Added theme toggle and GSAP animations
6. `/components/ThemeToggle.tsx` - NEW: Theme toggle component
7. `/components/AnimatedHero.tsx` - NEW: Hero section with animations
8. `/components/AnimatedCards.tsx` - NEW: Animated card components
9. `/components/ScrollAnimations.tsx` - NEW: Scroll-triggered animations

---

## Testing the Implementation

1. **Dark Mode Toggle**:
   - Click the sun/moon icon in navigation
   - Verify smooth color transitions
   - Check all components adapt to theme

2. **Scroll Animations**:
   - Scroll down the home page
   - Observe elements animating into view
   - Verify smooth performance

3. **Navigation Animations**:
   - Refresh page and watch navigation slide in
   - Toggle mobile menu and observe smooth animation
   - Click avatar and watch dropdown scale in

4. **Card Hover Effects**:
   - Hover over feature cards
   - Observe lift effect and shadow change
   - Icon rotation on hover

---

## Future Enhancements

1. Add more animation presets for different element types
2. Create animation variants system
3. Add page transition animations
4. Implement gesture-based animations for mobile
5. Add animation preferences for reduced motion
