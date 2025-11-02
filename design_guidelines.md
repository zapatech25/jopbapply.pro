# JobApply.pro Design Guidelines - Phase 1 MVP

## Design Approach

**Selected Approach**: Design System with Modern SaaS Patterns  
**Primary References**: Stripe (professional clarity), Linear (modern efficiency), Notion (approachable productivity)  
**Rationale**: This utility-focused productivity platform requires consistent, data-dense interfaces with emphasis on usability, learnability, and trust-building through professional presentation.

## Core Design Principles

1. **Professional Clarity**: Clean information hierarchy that communicates trustworthiness
2. **Efficient Navigation**: Minimal clicks to core actions (view plans, track applications, manage credits)
3. **Mobile-First Responsiveness**: Optimized for job seekers on-the-go
4. **Data Transparency**: Clear visibility of credits, plan status, and application tracking

---

## Typography System

**Font Families**:
- Primary: Inter (400, 500, 600, 700) via Google Fonts
- Monospace: JetBrains Mono (for SKUs, credit counts, numerical data)

**Hierarchy**:
- Hero Headlines: text-5xl md:text-6xl font-bold tracking-tight
- Page Titles: text-3xl md:text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Small Text/Labels: text-sm font-medium
- Micro Copy: text-xs

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6 on mobile, p-6 to p-8 on desktop
- Section spacing: py-12 to py-16 on mobile, py-20 to py-24 on desktop
- Grid gaps: gap-4 to gap-6 for cards, gap-2 to gap-4 for form elements

**Container Strategy**:
- Max-width containers: max-w-7xl for main content areas
- Form containers: max-w-md centered for auth pages
- Dashboard: max-w-6xl with sidebar on desktop

**Grid Patterns**:
- Pricing cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard stats: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
- Admin tables: Full-width responsive tables with horizontal scroll on mobile

---

## Component Library

### Navigation Header
- Fixed top navigation with max-w-7xl container
- Logo left-aligned with text-xl font-bold
- Desktop: Horizontal nav links (Home, Pricing, Dashboard)
- Mobile: Hamburger menu with slide-out drawer
- Auth state: Show user email + dropdown menu when logged in
- CTA button: "Get Started" or "Sign In" when logged out
- Height: h-16 with items-center flex layout

### Hero Section (Landing/Pricing Page)
- Height: min-h-[60vh] to min-h-[70vh] - not full viewport
- Layout: Two-column on desktop (60/40 split), stacked on mobile
- Left: Headline + subheadline + dual CTA buttons (primary + secondary)
- Right: Hero illustration/image showing job search dashboard or success metrics
- Background: Subtle gradient overlay or geometric pattern
- Padding: py-16 md:py-24

### Plan Cards (Pricing Page)
- Card structure: Rounded borders (rounded-xl), shadow (shadow-lg hover:shadow-xl transition)
- Layout: Vertical stack with clear visual separation
- Header: Plan name (text-xl font-bold) + SKU tag (text-xs monospace)
- Pricing: Large price display (text-4xl font-bold) + "/plan" suffix (text-lg)
- Features: Bulleted list with checkmark icons (Heroicons check-circle)
- Credit info: Highlighted badge showing "150 applications = 7 days processing"
- CTA: Full-width button at bottom (h-12 text-base font-semibold)
- Popular plan: Add "Most Popular" badge at top with distinct treatment
- Spacing: p-6 to p-8 internal padding, gap-4 between elements

### Authentication Forms
- Container: Centered card max-w-md with p-8 padding
- Logo: Centered at top with mb-8
- Headline: text-2xl font-bold mb-2
- Subheadline: text-sm mb-8
- Form fields: Stacked with gap-4
- Input styling: h-12 px-4 rounded-lg border with focus ring
- Labels: text-sm font-medium mb-1.5
- Submit button: Full-width h-12 rounded-lg font-semibold
- Footer links: text-sm with "Already have account?" type messaging
- Error messages: text-sm with icon, positioned below field

### Dashboard Layout
- Sidebar: w-64 fixed on desktop, drawer on mobile
  - Navigation items with icons (Heroicons)
  - Active state: Bold with indicator bar
  - User profile section at bottom
- Main Content: ml-64 on desktop, full-width on mobile
  - Page header: text-3xl font-bold mb-8
  - Stats cards grid showing credits, active plans, applications
  - Table for application tracking (striped rows, sortable headers)

### Stat Cards (Dashboard)
- Card: rounded-lg shadow with p-6
- Icon: Top-left with w-10 h-10 rounded-lg background
- Label: text-sm font-medium
- Value: text-3xl font-bold mt-2
- Change indicator: text-sm with up/down arrow (if applicable)
- Layout: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4

### Data Tables (Application Tracking)
- Header row: font-semibold with bottom border
- Rows: hover:bg-gray-50 transition, py-3 px-4
- Status badges: Inline badges with rounded-full px-3 py-1 text-xs font-medium
- Actions column: Icon buttons for view/edit
- Pagination: Bottom centered with page numbers + prev/next
- Mobile: Stack key data, hide secondary columns

### Admin Plan Management
- Split layout: List view (left) + Edit panel (right) on desktop
- Plan list: Card-based with quick actions (edit, deactivate toggle)
- Edit form: Vertical form with sections for pricing, credits, status
- CSV Upload: Drag-drop zone with file preview and validation feedback
- Action buttons: Positioned top-right with primary/secondary hierarchy

### Buttons
- Primary: h-10 to h-12, px-6, rounded-lg, font-semibold, shadow-sm
- Secondary: Same sizing with border treatment
- Icon buttons: w-10 h-10 rounded-lg with centered icon
- Button groups: gap-3 for multiple actions
- CTA buttons on images: backdrop-blur-md bg-white/20 with shadow-lg

### Form Elements
- Text inputs: h-12 px-4 rounded-lg border focus:ring-2
- Select dropdowns: Same as text inputs with chevron icon
- Checkboxes: w-4 h-4 rounded with focus ring
- Radio buttons: Circular with consistent sizing
- Labels: Always above input with mb-1.5, font-medium text-sm
- Help text: text-xs mt-1
- Required indicators: Asterisk in label

### Badges & Tags
- SKU tags: Monospace font, rounded-md px-2 py-1 text-xs
- Status badges: rounded-full px-3 py-1 text-xs font-medium
- Plan type indicators: Inline with pricing
- Credit count: Larger badges with icon + number

---

## Page-Specific Layouts

### Landing/Home Page
1. **Hero Section**: Two-column with headline, CTAs, and hero image
2. **Value Proposition**: Three-column feature grid with icons
3. **How It Works**: Numbered steps with illustrations
4. **Pricing Preview**: Condensed plan cards (3 most popular)
5. **Social Proof**: Testimonials or success metrics
6. **Final CTA**: Centered with dual buttons

### Pricing Page
1. **Header**: Brief headline + subheadline explaining credit system
2. **Plan Grid**: All 6 plans in responsive grid
3. **FAQ Section**: Accordion-style below plans
4. **Comparison Table**: Feature comparison (desktop only)

### Registration/Login Pages
- Centered single-column layout
- max-w-md container
- Minimal header (logo only)
- Form card with shadow
- Footer with links to other auth pages

### User Dashboard
- Sidebar navigation (fixed desktop, drawer mobile)
- Header with page title + user actions
- Stats row (4 cards)
- Application tracking table
- Plan details card showing active subscriptions

### Admin Panel
- Same sidebar structure as user dashboard
- Plan management: List + edit split view
- CSV upload interface with drag-drop
- User monitoring table with search/filter

---

## Images Section

**Hero Image** (Landing/Pricing):
- **Placement**: Right side of hero section (desktop), below headline (mobile)
- **Description**: Modern dashboard mockup showing job application tracking interface with green success indicators, application status cards, and credit counter. Clean, professional aesthetic with subtle shadows and the platform's UI visible.
- **Style**: Screenshot or illustration of the actual platform interface, showing 5-6 job applications in progress with varying statuses
- **Dimensions**: Approximately 600x450px, with subtle rounded corners and shadow

**Additional Images**:
- **Feature Icons**: Use Heroicons throughout (outline style for nav, solid for emphasis)
- **Empty States**: Illustration for "No applications yet" in dashboard
- **Success States**: Checkmark illustrations for completed applications
- **Profile Avatars**: Placeholder circles with initials when no user photo

---

## Responsive Breakpoints

- Mobile: < 640px (single column, stacked navigation)
- Tablet: 640px - 1024px (2-column grids, horizontal nav)
- Desktop: > 1024px (full multi-column layouts, fixed sidebar)

## Accessibility Standards

- All interactive elements: min h-10 tap targets on mobile
- Form inputs: Always paired with labels (not just placeholders)
- Focus states: Visible 2px ring on all interactive elements
- Icon buttons: Include sr-only text for screen readers
- Color contrast: Ensure all text meets WCAG AA standards
- Keyboard navigation: Tab order follows visual hierarchy