import ReactMarkdown, { type Components } from 'react-markdown';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { remarkSafeDirectives } from './directives';
import { Callout } from './Callout';
import { Video } from './Video';
import './SafeMarkdown.css';

// Renders author-written Markdown (content bodies, descriptions, help text).
// Import it through LazyMarkdown, which keeps the parser out of the main
// bundle.
//
// SECURITY — the two rules that make this safe, both of which are things NOT
// done rather than things done:
//
//   1. NEVER add `rehype-raw`. react-markdown drops raw HTML in the source by
//      default; rehype-raw is the single change that turns this component from
//      safe into injectable. There is no dangerouslySetInnerHTML anywhere in
//      this path, so safety is structural rather than "did we remember to
//      sanitize at this call site".
//   2. NEVER override `urlTransform`. The default strips javascript:,
//      vbscript: and data: URLs, so `[click](javascript:alert(1))` renders an
//      anchor with no href.
//
// Even when only admins write the content, this is defence in depth against a
// compromised account — which is exactly why it should not be "simplified"
// away. If USERS can write the content, these rules are the primary control.
interface SafeMarkdownProps {
  children: string;
}

export function SafeMarkdown({ children }: SafeMarkdownProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        // Order matters: remarkDirective parses the syntax, then our transform
        // maps the ALLOWLISTED names onto elements. An unmapped directive
        // renders as the text the author typed.
        remarkPlugins={[remarkGfm, remarkDirective, remarkSafeDirectives]}
        components={
          {
            // Widgets. Each validates its own attributes; nothing here trusts
            // what the author wrote, and none of them accepts a URL or markup.
            'md-video': Video,
            'md-callout': Callout,
            // External links open in a new tab, and rel stops the opened page
            // reaching back through window.opener.
            a: ({ href, children: linkChildren, ...props }) => {
              const external = /^https?:\/\//i.test(href ?? '');
              return (
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  {...props}
                >
                  {linkChildren}
                </a>
              );
            },
            // react-markdown's Components type enumerates HTML tags only, so the
            // widget elements above need this cast. It widens nothing at
            // runtime: an element renders only if remarkSafeDirectives produced
            // it, which only happens for an allowlisted directive name.
          } as Components
        }
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
