# Tralendr — Animated Homepage Concept

A React + TypeScript + Vite homepage concept using Tailwind CSS, GSAP, ScrollTrigger, and Lenis. The custom CSS layer provides the art-directed layout; Tailwind is configured for utility styling. It is designed as a frontend assignment showcase, not an official Tralendr release.

## Run locally

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Motion implemented

- GSAP intro timeline: navigation, eyebrow, split-line headline, CTA, hero reveal, and floating itinerary.
- ScrollTrigger parallax on the hero image and art panel.
- Reveal animations for manifesto, features, destinations, and closing CTA.
- Desktop pinned itinerary story with scrubbed text, route draw, destination pins, and itinerary rows.
- Lenis smooth scrolling synchronized with ScrollTrigger via GSAP ticker.
- Destination image hover zooms, CTA transitions, and animated progress line.
- Reduced-motion CSS fallback and a mobile layout that disables the pinned storytelling sequence.

## Notes

- Destination photos load from Unsplash URLs, so an internet connection is required for images and web fonts.
- The prompt planner is a UI concept only. It does not call an AI service or book travel.
- Replace concept copy, image assets, and any brand details with approved material before presenting externally.
- Check the exact Tralendr product details and brand assets before calling this an official redesign.
