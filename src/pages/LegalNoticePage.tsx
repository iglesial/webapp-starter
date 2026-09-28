import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Alert } from '../components/core/Alert';
import {
  CONTACT_EMAIL,
  HOSTING_PROVIDER,
  LEGAL_ENTITY,
  isLegalConfigured,
} from '../data/legalEntity';
import './LegalPages.css';

// Identity comes from src/data/legalEntity.ts, not the catalogs: an address
// reads the same in every language. Only the sentences around it are copy.
export function LegalNoticePage() {
  const { t } = useTranslation();

  // Only the fields actually supplied: an empty row is better than a guessed
  // one, and a wrong registration number is worse than a missing one.
  const rows = [
    { label: t('legal.publisherName'), value: LEGAL_ENTITY.name },
    { label: t('legal.publisherForm'), value: LEGAL_ENTITY.legalForm },
    { label: t('legal.publisherAddress'), value: LEGAL_ENTITY.address },
    { label: t('legal.publisherRegistration'), value: LEGAL_ENTITY.registration },
    { label: t('legal.publisherDirector'), value: LEGAL_ENTITY.publicationDirector },
    { label: t('legal.publisherVat'), value: LEGAL_ENTITY.vat },
    { label: t('legal.publisherPhone'), value: LEGAL_ENTITY.phone },
  ].filter((row) => row.value);

  return (
    <main className="legal-page">
      <h1>{t('legal.noticeTitle')}</h1>

      {!isLegalConfigured() && <Alert type="warning">{t('legal.notConfigured')}</Alert>}

      {rows.length > 0 && (
        <section aria-labelledby="publisher">
          <h2 id="publisher">{t('legal.publisherHeading')}</h2>
          <dl className="legal-facts">
            {rows.map((row) => (
              <div key={row.label} className="legal-fact">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {CONTACT_EMAIL && (
        <section aria-labelledby="contact">
          <h2 id="contact">{t('legal.contactHeading')}</h2>
          <p>
            <Trans
              i18nKey="legal.contactBody"
              values={{ email: CONTACT_EMAIL }}
              components={{ mail: <a href={`mailto:${CONTACT_EMAIL}`} /> }}
            />
          </p>
        </section>
      )}

      <section aria-labelledby="hosting">
        <h2 id="hosting">{t('legal.hostingHeading')}</h2>
        <p>{t('legal.hostingBody', HOSTING_PROVIDER)}</p>
        {HOSTING_PROVIDER.region && <p>{t('legal.hostingRegion', HOSTING_PROVIDER)}</p>}
        <p>
          <Trans
            i18nKey="legal.hostingContact"
            components={{
              host: <a href={HOSTING_PROVIDER.url} target="_blank" rel="noreferrer noopener" />,
            }}
          />
        </p>
      </section>

      <section aria-labelledby="ip">
        <h2 id="ip">{t('legal.ipHeading')}</h2>
        <p>{t('legal.ipBody')}</p>
      </section>

      <section aria-labelledby="data">
        <h2 id="data">{t('legal.dataHeading')}</h2>
        <p>
          <Trans i18nKey="legal.dataBody" components={{ privacy: <Link to="/privacy" /> }} />
        </p>
      </section>
    </main>
  );
}
