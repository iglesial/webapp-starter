import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Turns a closed set of markdown directives into elements that SafeMarkdown
// maps to React components. Directive syntax comes from remark-directive:
//
//   ::video{provider=youtube id=dQw4w9WgXcQ}
//   :::callout{type=warning}
//   Never commit your API key.
//   :::
//
// SECURITY — this transform IS the allowlist, and the allowlist is the whole
// model. Only the names below become components; every other directive is
// left untouched and therefore renders as plain text. That is deliberate: an
// unknown directive quietly becoming a component would mean an author could
// reach any component we ever register, and a typo would fail silently
// instead of visibly.
//
// Note what the widgets do NOT accept: no URLs, no HTML, no iframe src. The
// video widget takes a provider from a fixed set and an id, and builds the
// URL itself. Authors cannot express an arbitrary destination.
// To add a widget: add its name here, map `md-<name>` in SafeMarkdown.tsx,
// and make the component validate every attribute it reads.
const KNOWN_DIRECTIVES = new Set(['video', 'callout']);

// Element names handed to react-markdown's `components` map. Prefixed so they
// can never collide with a real HTML tag.
export const DIRECTIVE_TAG_PREFIX = 'md-';

interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

export function remarkSafeDirectives() {
  return (tree: Root) => {
    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (
        directive.type !== 'containerDirective' &&
        directive.type !== 'leafDirective' &&
        directive.type !== 'textDirective'
      ) {
        return;
      }
      const data = (directive.data ??= {});

      // Unknown name: render as a plain span, never as a component. Left
      // untouched it would render as NOTHING — safe, but a typo would silently
      // swallow the author's content. A container keeps its body (so words are
      // never lost) and a leaf shows its own name back, so the mistake is
      // visible on the page rather than invisible.
      if (!KNOWN_DIRECTIVES.has(directive.name)) {
        data.hName = 'span';
        data.hProperties = { className: 'md-directive-unknown' };
        const withChildren = node as unknown as { children?: unknown[] };
        if (directive.type !== 'containerDirective' && !withChildren.children?.length) {
          withChildren.children = [{ type: 'text', value: `::${directive.name}` }];
        }
        return;
      }

      data.hName = `${DIRECTIVE_TAG_PREFIX}${directive.name}`;
      // Attributes are passed through as-is; each component validates its own
      // (see Video's provider allowlist). Nothing here trusts them.
      data.hProperties = { ...directive.attributes };
    });
  };
}
