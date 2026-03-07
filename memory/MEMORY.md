# CV Website — Project Memory

## Stack
- React 19 + Vite 6 + Tailwind v4 + react-router-dom v7
- `motion` (motion/react) for animations — installed
- `rooks` for useOutsideClick
- i18next for RU/EN localization
- Font: Source Code Pro (default)

## Key Files
- `src/App.jsx` — wraps everything in ThemeProvider + AnimatedBackground
- `src/contexts/ThemeContext.jsx` — visual theme state (default/brutalism/futurism/retro/terminal)
- `src/components/AnimatedBackground.jsx` — theme-aware canvas BG, reads themeRef
- `src/components/header/Header.jsx` — nav + lang + ThemeSwitcher + dark/light toggle
- `src/components/ThemeSwitcher.jsx` — dropdown to pick visual theme
- `src/index.css` — Google Fonts + Tailwind + all theme CSS overrides
- `src/pages/GamesPage.jsx` — 4 games grid (no AnimatedBackground here, it's in App)

## Games
- `SnakeGame.jsx` — canvas, delta-time: `g.elapsed += dt; if >= TICK_MS(133) move`
- `FlappyBird.jsx` — canvas, delta-time: `s.bvy += GRAVITY * (dt/DT60); s.pipeTimer`
- `CatchEgg.jsx` — canvas, delta-time: exponential lerp basket, egg vy scaled by dt/DT60
- `Game2048.jsx` — React + motion/react, tile IDs tracked across moves, layout animations

## Theme System
- `data-theme` attribute on `<html>` element
- Themes: default | brutalism | futurism | retro | terminal
- ALL themes support dark + light mode via user toggle (no forced overrides)
- Dark/light toggle always visible in header for all themes
- AnimatedBackground switches drawing mode via `themeRef.current`, passes `isDark()` to all draw fns
- CSS uses `html[data-theme="X"]:not(.dark)` and `html[data-theme="X"].dark` for full coverage
- ThemeContext: only sets `data-theme` attr, never touches `.dark` class

## Backgrounds per theme
- default: interactive dot push grid (original)
- brutalism: bold grid lines + mouse crosshair + diagonal stripes (red accent)
- futurism: hexagonal grid + neon glow + particles + scanlines (cyan)
- retro: halftone wave dots + animated bands (teal/coral hues)
- terminal: matrix rain characters (VT323 font, green)

## Fonts per theme
- default: Source Code Pro
- brutalism: Space Mono
- futurism: Share Tech Mono + Orbitron
- retro: Courier Prime
- terminal: VT323 + Fira Code

## Patterns
- Frame-rate fix: `const DT60 = 16.667; scale = dt/DT60; value *= scale`
- ThemeContext phaseRef pattern: store state in ref for stable event handlers
- Games use `hover` state (via mouseenter/mouseleave) to gate keyboard input
- `themeRef` in AnimatedBackground to avoid re-mounting on theme change
