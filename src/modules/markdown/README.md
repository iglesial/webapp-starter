# Markdown module (optional)

Renders author-written Markdown safely, with two widgets. Nothing in the app uses it until you import it.

```tsx
import { LazyMarkdown } from '../modules/markdown/LazyMarkdown';

<LazyMarkdown>{article.body}</LazyMarkdown>
```

`LazyMarkdown` loads the parser (~100 kB) on demand, so it stays out of the main bundle. Import `SafeMarkdown` directly only from code that is itself lazy-loaded.

## What authors can write

GitHub-flavoured Markdown (tables, strikethrough, task lists) plus:

```md
::video{provider=youtube id=dQw4w9WgXcQ title="Intro"}

:::callout{type=warning}
Never commit your **API key**.
:::
```

- `provider` is `youtube` (via youtube-nocookie) or `vimeo`, and `id` must match `[\w-]{1,64}`. The embed URL is built in code, so authors never supply a URL.
- **Videos load on click.** No request reaches Google or Vimeo until the reader presses play. That avoids third-party cookies and a consent banner.
- `callout` types are `info`, `tip` and `warning`. Anything else falls back to `info`.
- An unknown directive renders as visible text, so a typo shows up on the page and is never silently swallowed.

## Security — the rules that must not be undone

These are *absences*, which makes them easy to remove by accident. `SafeMarkdown.test.tsx` and `widgets.test.tsx` assert them:

1. **No `rehype-raw`.** Raw HTML in the source is dropped, not rendered.
2. **No `urlTransform` override.** `javascript:` links lose their `href`.
3. **No `dangerouslySetInnerHTML`** anywhere in this path.
4. **Widgets are an allowlist** (`KNOWN_DIRECTIVES` in `directives.ts`). To add one:
   - add its name to `KNOWN_DIRECTIVES`;
   - map `md-<name>` in `SafeMarkdown.tsx`;
   - make the component validate every attribute it reads;
   - never accept a URL or markup from the author.

## Removing this module

1. Delete `src/modules/markdown/`.
2. Delete `src/i18n/messages/{en,fr}/markdown.ts` and the `markdown` entries in both `index.ts` files.
3. Run `npm uninstall react-markdown remark-gfm remark-directive unist-util-visit`.
