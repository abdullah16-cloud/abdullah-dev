# Project Assets Log — Honda Bikes Store

This document tracks all visual media, illustrations, placeholders, and licensed assets used across the application.

> **Important Notice:**
> No copyrighted, trademarked, or unauthorized images are scraped or hotlinked from official Honda or Atlas Honda websites.
> All bike and hero visuals currently use structured `<ImagePlaceholder />` components or inline vector graphics.
> **Replace all placeholders with authorized/licensed images before public production launch.**

---

## Asset Inventory Table

| Asset Identifier | Intended Placement | File Name / Source | License / Attribution | Current Status | Action Required Before Launch |
|---|---|---|---|---|---|
| `hero-motorcycle` | Homepage Hero Section | `<ImagePlaceholder />` / Inline SVG | Original / In-house vector | **Placeholder** | Swap with authorized high-resolution hero photo in `HeroSection.jsx` |
| `bike-honda-cd-70` | Featured Models (CD 70) | `<ImagePlaceholder />` | N/A (CSS/SVG component) | **Placeholder** | Add licensed photo to `src/assets/bikes/cd70.webp` and update `bikes.js` |
| `bike-honda-cg-125` | Featured Models (CG 125) | `<ImagePlaceholder />` | N/A (CSS/SVG component) | **Placeholder** | Add licensed photo to `src/assets/bikes/cg125.webp` and update `bikes.js` |
| `bike-honda-cb-125f` | Featured Models (CB 125F) | `<ImagePlaceholder />` | N/A (CSS/SVG component) | **Placeholder** | Add licensed photo to `src/assets/bikes/cb125f.webp` and update `bikes.js` |
| `bike-honda-cg-150` | Featured Models (CG 150) | `<ImagePlaceholder />` | N/A (CSS/SVG component) | **Placeholder** | Add licensed photo to `src/assets/bikes/cg150.webp` and update `bikes.js` |
| `icon-benefits-*` | Benefits Section Icons | Handcrafted inline SVGs | MIT / Project owned | **Active (Vector)** | Ready for production |
| `icon-delivery-*` | Delivery & COD Steps Icons | Handcrafted inline SVGs | MIT / Project owned | **Active (Vector)** | Ready for production |

---

## Asset Guidelines for Developers

1. **Alt Attributes:** All `<img>` tags must include explicit, descriptive `alt` text explaining what the motorcycle model and orientation is (e.g. `alt="Honda CG 125 in red finish, studio side profile"`).
2. **Dimensions & Layout Shift:** Always supply `width` and `height` (or aspect-ratio CSS) to prevent Cumulative Layout Shift (CLS).
3. **Lazy Loading:** Use `loading="lazy"` on all cards, category blocks, and below-the-fold media. Keep the above-the-fold Hero asset loaded eagerly (`loading="eager"` or default).
4. **Local Hosting:** Store approved images under `src/assets/` and bundle them through Vite. Avoid unvetted external image CDNs.

