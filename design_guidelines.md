# Design Guidelines: Simple "Olá" HTML Page

## Design Approach
**Minimalist Single-Purpose Page** - This is an ultra-simple demonstration focusing purely on clean typography and centered content presentation.

## Core Design Elements

### Typography
- **Primary Text ("Olá")**: Large, bold display font
  - Desktop: text-6xl or text-7xl (60-72px equivalent)
  - Mobile: text-5xl (48px equivalent)
  - Weight: font-bold or font-semibold
- **Font Family**: Use Google Fonts - Poppins, Inter, or Montserrat for modern feel
- **Text alignment**: Centered

### Layout System
- **Spacing**: Use Tailwind spacing units of 4, 6, and 8 for consistency
- **Container**: Full viewport height (h-screen) with flexbox centering
- **Padding**: p-4 or p-6 for mobile edge spacing
- **Responsive**: Single breakpoint at 'md:' if needed

### Structure
**Single Centered Section:**
- Full-screen flex container (flex items-center justify-center)
- "Olá" text centered vertically and horizontally
- Optional: Subtle text shadow or gradient for visual interest
- Optional: Small tagline or subtitle below in lighter weight (text-xl, font-light)

### Minimal Enhancements (Keep Simple)
- Smooth fade-in animation on page load (animate-fade-in)
- Subtle letter-spacing on the main text (tracking-wide)
- Clean, uncluttered presentation with generous whitespace

### No Images Required
This design relies purely on typography and negative space for impact.

## Key Principles
- **Less is More**: The beauty is in the simplicity
- **Perfect Centering**: Mathematically centered content
- **Breathing Room**: Generous whitespace around the text
- **Readable Typography**: Clear, impactful font choice

**Implementation Note**: This is intentionally minimal - resist the urge to add complexity. The elegance comes from restraint.