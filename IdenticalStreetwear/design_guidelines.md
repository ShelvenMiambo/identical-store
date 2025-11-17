# IDENTICAL Streetwear - Design Guidelines

## Design Approach
**Reference-Based**: Combining lerramz.com's clean structural simplicity with streetwear leaders (Supreme, Palace, KITH) to create an authentic urban shopping experience that prioritizes quick conversions while celebrating Mozambican street culture.

## Core Design Principles
- **Urban Minimalism**: Bold typography, generous whitespace, product-first layouts
- **Cultural Authenticity**: Showcase Mozambican street culture through imagery and design elements
- **Conversion Optimized**: Clear CTAs, minimal friction from browse to checkout
- **Mobile-First**: 70% of streetwear purchases happen on mobile

---

## Typography System

**Primary Font**: Inter or Archivo (via Google Fonts CDN)
- Headings: 700-900 weight, uppercase for impact (H1: 2.5rem-4rem, H2: 2rem-3rem)
- Body: 400-500 weight, 1rem-1.125rem for readability
- Product Names: 600 weight, 1.25rem-1.5rem
- Prices: 700 weight, 1.5rem-2rem (prominent)
- CTA Buttons: 600 weight, uppercase, 0.875rem-1rem

**Secondary Font**: Space Grotesk (for logo/special headings)
- Logo lockup and hero statements only

---

## Layout System

**Spacing Units**: Tailwind utilities - consistently use 4, 6, 8, 12, 16, 24 units
- Component padding: p-6 to p-8 (mobile), p-12 to p-16 (desktop)
- Section spacing: py-16 (mobile), py-24 to py-32 (desktop)
- Grid gaps: gap-4 to gap-6 (mobile), gap-8 (desktop)

**Container Widths**:
- Full-width hero: w-full
- Content sections: max-w-7xl mx-auto px-4
- Product grids: max-w-7xl
- Checkout forms: max-w-2xl

**Grid Systems**:
- Products: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Collections: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Mobile: Always stack to single column below 640px

---

## Component Library

### Navigation
**Header**: Fixed top, backdrop-blur on scroll
- Logo left, centered navigation (Loja, Coleções, Sobre), cart icon right
- Mobile: Hamburger menu, slide-in drawer
- Shopping cart badge: small circle with item count

**Footer**: 4-column desktop, stacked mobile
- Column 1: Brand statement + social links
- Column 2: Quick links (Loja, FAQ, Contacto)
- Column 3: Legal (Termos, Privacidade)
- Column 4: Newsletter signup form
- Bottom bar: Payment methods icons + copyright

### Product Cards (lerramz.com style)
- Aspect ratio: 3:4 product image (square or portrait)
- Hover: Subtle scale (1.02) on image
- Layout: Image → Product Name (600 weight) → Author/Collection → Price (bold)
- Badge: "Novo" or "Esgotado" top-right corner overlay

### Buttons
**Primary CTA** (Add to Cart, Checkout):
- Solid fill, bold text, py-3 px-8, rounded-md
- Full width on mobile, auto width desktop
- Hover: Slight darken effect

**Secondary** (Continue Shopping, View Details):
- Outline style, same padding
- Hover: Fill transition

### Forms
- Input fields: border-2, rounded-md, py-3 px-4
- Labels: uppercase, text-sm, font-600, mb-2
- Error states: red border + error text below
- Focus: Thicker border weight

### Cart Drawer
- Slide from right, overlay backdrop
- Product thumbnails + quantity controls
- Sticky bottom: Subtotal + "Finalizar Compra" button

---

## Page-Specific Layouts

### Homepage
1. **Hero Section** (70vh - 80vh):
   - Full-width background image showcasing latest collection/lifestyle
   - Centered: Bold headline (H1) + tagline + dual CTAs ("Explorar a Loja" + "Nova Coleção")
   - Buttons: Blurred glass background (backdrop-blur-sm with semi-transparent fill)

2. **Featured Collections** (py-24):
   - 2-column grid (desktop), stacked (mobile)
   - Large collection cards with overlay text + CTA

3. **Produtos em Destaque** (py-16):
   - 4-column product grid (lerramz.com style)
   - "Ver Mais" button centered below

4. **Sobre a IDENTICAL** (py-24):
   - 2-column: Left (imagery/street culture visuals), Right (brand story text)
   - Emphasis on urban culture, Mozambican pride

5. **Social Proof** (py-16):
   - Instagram feed grid or customer photos wearing products
   - 3-4 columns of square images

### Collections/Loja Page
- Filter sidebar (desktop) or drawer (mobile): Coleção, Tamanho, Cor checkboxes
- Product grid: 3-4 columns, infinite scroll or pagination
- Sort dropdown: top-right (Mais Recente, Preço Baixo-Alto, etc.)

### Product Page
- **Desktop**: 2-column layout
  - Left (60%): Image gallery with thumbnails below, click to enlarge/zoom
  - Right (40%): Product name, price, description, size selector (visual size buttons), color swatches, quantity, "Adicionar ao Carrinho" (full width), size guide link, accordion for details (Materiais, Cuidados, Envio)
  
- **Mobile**: Stacked, image carousel with dots

### Checkout (1-2 Steps)
**Step 1**: Shipping info form (single column, max-w-2xl centered)
- Fields: Nome, Email, Telefone, Endereço, Cidade, Província
- Order summary sidebar (desktop) or collapsible (mobile)

**Step 2**: Payment via PaySuite redirect
- Display order summary + "Proceder ao Pagamento" button
- Upon click, redirect to PaySuite checkout_url

### User Account
- Sidebar navigation (desktop): Pedidos, Perfil, Endereços, Logout
- Main content area: Order history table or profile forms

### Admin Dashboard
- Sidebar menu: Dashboard, Produtos, Coleções, Pedidos, Cupões
- Table views with action buttons, clean data presentation

---

## Images

**Hero Section**: 
- Large lifestyle image (1920x1080 minimum) showing Mozambican urban culture, people wearing IDENTICAL apparel in street settings
- Alternative: Bold graphic pattern or street art with product overlay

**Product Images**:
- High-quality product photos on clean background (white/light gray)
- Minimum 3 images per product: front, back, detail/wear shot
- Lifestyle images showing product in use (street photography style)

**Collections Cards**:
- Atmospheric images representing each collection's theme
- 1200x800 minimum, text overlay-friendly

**About Section**:
- Behind-the-scenes: design process, street culture inspiration, Mozambican urban landscapes
- Team photos (optional): founders/designers in casual streetwear settings

**Social Proof/Instagram Grid**:
- User-generated content or styled lifestyle shots
- Square format (1:1 ratio), 600x600 minimum

---

## Special Considerations

**Streetwear Aesthetics**:
- Use bold, impactful imagery over decorative graphics
- Limit animations - quick fade-ins only, no distracting motion
- Typography as design element - large, bold statements

**Mobile Commerce Priority**:
- Thumb-friendly tap targets (min 44x44px)
- Sticky "Add to Cart" button on product pages
- One-tap checkout initiation
- Fast image loading (WebP format, lazy-load)

**Cultural Elements**:
- Subtle integration of Mozambican patterns/colors in accents (optional)
- Portuguese language throughout
- Local payment method icons prominent (M-Pesa, e-Mola)

**Trust Signals**:
- Payment method logos in footer
- Secure checkout badge
- Contact info visible (WhatsApp number common in Mozambique)

---

This design balances lerramz.com's conversion-optimized simplicity with the bold, visual identity required for streetwear, creating an authentic Mozambican urban shopping experience.