import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Video.css';

// Providers are an allowlist, and the embed URL is BUILT here from an id —
// the author never supplies a URL, let alone an iframe. That is what keeps
// `::video{provider=… id=…}` from being an arbitrary-embed primitive.
//
// youtube-nocookie is deliberate: the regular domain sets cookies on load.
const PROVIDERS = {
  youtube: (id: string) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
  vimeo: (id: string) => `https://player.vimeo.com/video/${encodeURIComponent(id)}`,
} as const;

type Provider = keyof typeof PROVIDERS;

// Ids are opaque handles, not free text. Rejecting anything else stops a
// crafted id from escaping the path segment it is interpolated into.
const ID_PATTERN = /^[\w-]{1,64}$/;

interface VideoProps {
  provider?: string;
  id?: string;
  title?: string;
}

export function Video({ provider, id, title }: VideoProps) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  const key = provider as Provider | undefined;
  const valid = key !== undefined && key in PROVIDERS && !!id && ID_PATTERN.test(id);

  if (!valid) {
    // A malformed directive is an authoring mistake: say so on the page
    // rather than rendering nothing, or an author will never notice.
    if (import.meta.env.DEV) {
      console.error('Markdown video: unsupported provider or id', { provider, id });
    }
    return (
      <p className="md-video-invalid" role="note">
        {t('markdown.videoUnavailable')}
      </p>
    );
  }

  const label = title ?? t('markdown.videoTitle');

  // Click to load: no request reaches YouTube or Vimeo until the reader asks
  // for the video. Three reasons, in order — (1) an iframe that loads on
  // render contacts a third party and can set cookies before the reader has
  // done anything — and would need a consent banner; (2) an embed is roughly a megabyte of third-party script;
  // (3) it keeps a video off the network when it is on a slide or a section
  // the reader never reaches.
  if (!playing) {
    return (
      <div className="md-video">
        <button
          type="button"
          className="md-video-facade"
          onClick={() => setPlaying(true)}
          aria-label={t('markdown.videoPlay', { title: label })}
        >
          <span className="md-video-play" aria-hidden="true">
            ▶
          </span>
          <span className="md-video-label">{label}</span>
          <span className="md-video-hint">{t('markdown.videoLoadsFrom', { provider: key })}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="md-video">
      <iframe
        className="md-video-frame"
        src={`${PROVIDERS[key](id)}?autoplay=1`}
        title={label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
