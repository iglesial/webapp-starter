# Presentations module (optional)

Full-screen slide decks as React routes: `/presentations` lists them, and `/presentations/:slug` presents one. Decks sit **outside** the app shell (no navbar or footer), each is its own lazy chunk, and navigation works from the keyboard:
- **→ ↓ Space Page Down:** next slide.
- **← ↑ Page Up:** previous slide.
- **Home / End:** first / last slide.

## Making a deck

1. Copy `decks/example/` to `decks/<your-slug>/`.
2. Register it in `registry.ts` with a slug, title, subtitle, and `load: () => import('./decks/<your-slug>/YourDeck')`.
3. Open `/presentations/<your-slug>`.

A deck is a default-exported component that renders `<SlideDeck slides={[…]} deckTitle="…" />`. Each slide is a component. Useful pieces:
- **`isActive`:** `SlideDeck` injects it into slide components, so you can start effects only when the slide is on screen, e.g. `<WordCloud autoRevealOn={isActive} />`.
- **`className="stagger-item"` with `style={staggerStyle(i)}`:** staggered entrances when the slide appears.
- **`presentation-card`:** the shared card treatment, with an accent bar and a gradient wash.
- **`WordCloud`:** weighted terms revealed on click, or automatically.

## Language

The deck **chrome** (arrows, dots, the word-cloud trigger) is translated through the `presentations` catalog namespace. **Slide text is authored content**, written in the presenter's language like a talk. It's the one place in the app where copy is written in JSX rather than in the catalogs. Keep it inside `decks/`.

## Access

Decks are **public**, like a talk's slides. If yours aren't, wrap the elements in `routes.tsx` with `<ProtectedRoute>`.

## Removing this module

1. Delete `src/modules/presentations/`.
2. Delete `src/i18n/messages/{en,fr}/presentations.ts` and the `presentations` entries in both `index.ts` files.
3. Remove the `presentationRoutes()` lines from `src/App.tsx`.
