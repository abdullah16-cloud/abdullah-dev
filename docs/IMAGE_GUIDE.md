# Motorcycle Image Integration Guide

This guide explains how to replace placeholder visuals with real, authorized motorcycle photography before production launch.

---

## 1. Authorized Sourcing Rules

* **Written Permission / Ownership:** Only use photographs taken by your team, licensed from stock photography with commercial rights, or provided with explicit written permission from regional dealerships.
* **Do NOT Scrape:** Do not copy, scrape, or hotlink images directly from the official Honda Motor Co. or Atlas Honda Limited websites.

---

## 2. File Specifications & Naming Convention

* **Format:** WebP (`.webp`) is strongly recommended for high performance and minimal payload. High-quality JPEG (`.jpg`) is also supported.
* **Dimensions:**
  * **Main / Showcase:** 1200px width (aspect-ratio `16:10` or `4:3`).
  * **Thumbnail:** 300px width.
* **Directory:** Place all bike imagery in:
  ```text
  frontend/src/assets/bikes/
  ```
* **Naming Convention:**
  ```text
  <bike-id>-<angle-number>.webp
  ```
  *Examples:*
  * `honda-cd-70-1.webp` (side profile)
  * `honda-cd-70-2.webp` (front three-quarters)
  * `honda-cg-125-1.webp`

---

## 3. Registering Photos in the Codebase

1. Open `frontend/src/data/bikes.js`.
2. Locate the corresponding motorcycle record by its `id`.
3. Add the relative image paths to the `images` array:
   ```javascript
   {
     id: 'honda-cg-125',
     name: 'Honda CG 125',
     // ...
     images: [
       '/src/assets/bikes/honda-cg-125-1.webp',
       '/src/assets/bikes/honda-cg-125-2.webp'
     ],
   }
   ```
4. If the `images` array is empty or an image fails to load, the UI automatically and gracefully falls back to `<ImagePlaceholder />` with zero layout shift.

---

## 4. Documentation & Accessibility Checklist

After adding new photography:
1. Update `docs/ASSETS.md` with:
   * File name
   * Source / photographer credit
   * License type
   * Date added
2. Confirm descriptive `alt` text is passed (e.g. `"Honda CG 125 in classic red finish, studio side profile"`).

