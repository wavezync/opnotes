# Design Guidelines

This document defines the visual language, component patterns, and design system for Op Notes. Follow these guidelines to maintain consistency and create a cohesive, professional medical application interface.

## Design Philosophy

Op Notes uses a **clinical-professional** aesthetic: clean, trustworthy, and efficient. The design balances:
- **Clarity** - Medical data must be instantly readable
- **Warmth** - Soft gradients and rounded corners soften clinical coldness
- **Hierarchy** - Clear visual distinction between primary actions and secondary information
- **Consistency** - Repeatable patterns that feel familiar across all pages

---

## Typography

### Font Families

```css
--font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

### Usage Patterns

| Context | Style | Example |
|---------|-------|---------|
| Page titles | `text-2xl font-bold tracking-tight` | "Add Patient" |
| Card titles | `text-xs font-medium uppercase tracking-wider text-muted-foreground` | "QUICK TIPS" |
| Body text | `text-sm` | General content |
| Labels | `text-[10px] text-muted-foreground uppercase tracking-wider` | "PHN", "WARD" |
| Values | `text-sm font-medium` | Patient name, dates |
| Monospace | `font-mono` | PHN numbers, BHT codes |

---

## Color System

### Semantic Colors (CSS Variables)

```css
/* Core */
--background        /* Page background */
--foreground        /* Primary text */
--card              /* Card backgrounds */
--card-foreground   /* Card text */

/* Interactive */
--primary           /* Primary actions, links */
--primary-foreground
--secondary         /* Secondary elements */
--muted             /* Disabled, subtle backgrounds */
--muted-foreground  /* Secondary text */
--accent            /* Hover states, highlights */

/* Feedback */
--destructive       /* Delete, errors */
```

### Accent Color Palette

Use these semantic colors for IconBox, badges, and visual accents:

| Color | Use Case | Tailwind Classes |
|-------|----------|------------------|
| `emerald` | Patients, success, primary medical | `bg-emerald-500/10 text-emerald-500` |
| `violet` | Doctors, professional | `bg-violet-500/10 text-violet-500` |
| `blue` | Information, identifiers (PHN) | `bg-blue-500/10 text-blue-500` |
| `amber` | Warnings, tips, dates | `bg-amber-500/10 text-amber-500` |
| `rose` | Important alerts, post-op | `bg-rose-500/10 text-rose-500` |
| `cyan` | Follow-ups, secondary actions | `bg-cyan-500/10 text-cyan-500` |
| `purple` | Medications, inward management | `bg-purple-500/10 text-purple-500` |
| `teal` | Referrals | `bg-teal-500/10 text-teal-500` |
| `pink` | Female gender indicator | `bg-pink-500/10 text-pink-500` |
| `red` | Blood group, emergencies | `bg-red-500/10 text-red-500` |

### Color Mapping by Entity

```
Patients  → emerald (life, health)
Doctors   → violet (professional, trusted)
Surgeries → emerald (medical procedures)
Settings  → blue (system, configuration)
```

---

## Spacing & Layout

### Page Structure

All pages follow a consistent structure:

```tsx
<PageLayout | FormLayout | DetailLayout>
  <PageHeader ... />     {/* Fixed header with back button, title, actions */}
  <Content>              {/* Scrollable content area */}
</Layout>
```

### Padding Standards

| Area | Value | Class |
|------|-------|-------|
| Page container | 24px | `p-6` |
| Card padding | 24px (header: 16px top) | `p-6`, `pt-4` |
| Card content | 24px horizontal, 12px vertical | `px-4 py-3` |
| Between sections | 16px | `gap-4` |
| Between cards | 24px | `gap-6` |

### Grid Layouts

**Detail View (sidebar + content):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
  <div className="md:col-span-3">{/* Sidebar */}</div>
  <div className="md:col-span-9">{/* Main content */}</div>
</div>
```

**Form Layout (form + tips):**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* Form */}</div>
  <div className="lg:col-span-1">{/* Tips sidebar */}</div>
</div>
```

---

## Component Patterns

### Layout Components (`src/renderer/src/components/layouts/`)

| Component | Purpose | Props |
|-----------|---------|-------|
| `PageLayout` | Base container with header | `header`, `children` |
| `DetailLayout` | Sidebar + main content | `header`, `sidebar`, `children`, `sidebarWidth` |
| `FormLayout` | Form + optional tips | `header`, `form`, `sidebar?` |
| `PageHeader` | Universal page header | `icon`, `iconColor`, `title`, `subtitle?`, `showBackButton?`, `actions?` |
| `IconBox` | Colored icon container | `icon`, `color`, `size` |
| `InfoItem` | Label + value display | `icon`, `iconColor`, `label`, `value`, `mono?` |

### IconBox Sizes

```tsx
const sizeMap = {
  sm: 'h-6 w-6',   // Small labels, inline icons
  md: 'h-7 w-7',   // Default for info items
  lg: 'h-9 w-9',   // Card headers
  xl: 'h-12 w-12', // Page headers
}
```

### Card Patterns

**Standard Card:**
```tsx
<Card className="bg-gradient-to-br from-card to-card/80">
  <CardHeader className="pb-3 pt-4">
    <div className="flex items-center gap-2.5">
      <IconBox icon={Icon} color="emerald" size="lg" />
      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Section Title
      </CardTitle>
    </div>
  </CardHeader>
  <CardContent className="pt-0">
    {/* Content */}
  </CardContent>
</Card>
```

**Colored Info Card (for tips/notes):**
```tsx
<Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border-emerald-500/20">
  <CardContent className="p-4">
    <p className="text-sm text-muted-foreground">
      Informational text here.
    </p>
  </CardContent>
</Card>
```

### Button Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| `gradient` | Primary actions | "Save Patient", "Add Surgery" |
| `default` | Standard actions | "Submit" |
| `outline` | Secondary actions | "Add Follow-up" |
| `ghost` | Tertiary/icon buttons | Back button, edit icons |
| `destructive` | Delete actions | "Delete" |

**Button with Icon:**
```tsx
<Button variant="gradient" leftIcon={<Save className="h-4 w-4" />}>
  Save Changes
</Button>
```

---

## Animation System

### Entrance Animations

```css
/* Page entrance */
.animate-fade-in-up     /* Primary page content */

/* Staggered card entrance */
style={{ animationDelay: '100ms' }}
style={{ animationDelay: '150ms' }}
```

### Animation Classes

| Class | Duration | Use |
|-------|----------|-----|
| `animate-fade-in-up` | 400ms | Page headers, cards |
| `animate-scale-in` | 300ms | Modals, popovers |
| `animate-slide-in-right` | 350ms | Sidebars, panels |
| `animate-shimmer` | 2s loop | Loading skeletons |
| `animate-pulse-soft` | 2s loop | Subtle attention |

### Transition Utilities

```css
.transition-spring   /* Bouncy interactions */
.transition-bounce   /* Playful feedback */
.hover-lift          /* Card hover effect */
```

---

## Shadow System

Use theme-aware shadows that adapt to light/dark mode:

```css
.shadow-theme-sm     /* Subtle elevation */
.shadow-theme-md     /* Standard cards */
.shadow-theme-lg     /* Elevated/hover state */
.shadow-theme-primary /* Primary button glow */
```

---

## Form Patterns

### Input Groups

```tsx
<div className="space-y-2">
  <Label>Field Label</Label>
  <Input placeholder="Enter value..." />
</div>
```

### Tips Sidebar Pattern

```tsx
<Card className="bg-gradient-to-br from-card to-card/80">
  <CardHeader>
    <IconBox icon={Lightbulb} color="amber" size="lg" />
    <CardTitle>Quick Tips</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-start gap-3">
      <IconBox icon={Hash} color="blue" size="sm" className="mt-0.5" />
      <div>
        <p className="text-sm font-medium">Tip Title</p>
        <p className="text-xs text-muted-foreground">Explanation text</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Theme System

Op Notes supports 12 distinctive themes, each with light/dark variants:

| Theme | Character | Primary Color |
|-------|-----------|---------------|
| Aurora | Modern, clean | Teal/cyan |
| Meadow | Natural, organic | Fresh green |
| Bloom | Vibrant, energetic | Pink/magenta |
| Latte | Warm, cozy | Brown/cream |
| Slate | Professional, neutral | Blue-gray |
| Midnight | Deep, focused | Dark blue |
| Obsidian | Sleek, minimal | Pure dark |
| Ocean | Calm, expansive | Deep blue |
| Retro | Vintage, nostalgic | Orange/brown |
| Ember | Warm, intense | Red/orange |
| Frost | Cool, crisp | Ice blue |
| Sakura | Soft, delicate | Cherry blossom |

Themes are applied via `data-theme` attribute and defined in `src/renderer/src/styles/themes.css`.

---

## Responsive Breakpoints

```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets, sidebar collapse */
lg: 1024px  /* Desktop, form layouts switch */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra wide screens */
```

---

## Accessibility Guidelines

1. **Color contrast**: All text meets WCAG AA standards
2. **Focus states**: Visible focus rings on all interactive elements (`focus-visible:ring-2`)
3. **Cursor hints**: Pointer cursor on all clickable elements
4. **Screen reader**: Use semantic HTML, ARIA labels where needed
5. **Keyboard nav**: All actions accessible via keyboard

---

## File Organization

```
src/renderer/src/
├── components/
│   ├── layouts/        # PageLayout, DetailLayout, FormLayout, etc.
│   ├── ui/             # Shadcn/Radix base components
│   ├── patient/        # Patient-specific components
│   ├── doctor/         # Doctor-specific components
│   ├── surgery/        # Surgery-specific components
│   └── print/          # Print-related components
├── styles/
│   └── themes.css      # Theme definitions
└── index.css           # Global styles, animations, utilities
```

---

## Quick Reference

### Creating a New Page

1. Choose layout: `DetailLayout` (view), `FormLayout` (edit/add), or `PageLayout` (custom)
2. Add `PageHeader` with appropriate icon and color
3. Use `Card` components for content sections
4. Apply `animate-fade-in-up` for entrance animation
5. Use `IconBox` for consistent icon styling

### Creating a New Card Section

```tsx
<Card className="bg-gradient-to-br from-card to-card/80">
  <CardHeader className="pb-3 pt-4">
    <div className="flex items-center gap-2.5">
      <IconBox icon={YourIcon} color="emerald" size="lg" />
      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Section Title
      </CardTitle>
    </div>
  </CardHeader>
  <CardContent className="pt-0">
    {/* Your content */}
  </CardContent>
</Card>
```

### Adding Info Items

```tsx
<InfoItem
  icon={Calendar}
  iconColor="amber"
  label="Date"
  value={formatDate(date)}
/>
```
