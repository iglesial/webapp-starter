import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Alert } from '../components/core/Alert';
import type { ParseKeys } from 'i18next';
import { isAnalyticsEnabled } from '../analytics';
// Optional module: its disclosures appear only while it is switched on.
import { isPaymentsEnabled } from '../modules/payments/enabled';
import {
  CONTACT_EMAIL,
  PROCESSORS,
  SUPERVISORY_AUTHORITY,
  isLegalConfigured,
} from '../data/legalEntity';
import './LegalPages.css';

// Bump whenever what the app collects changes — and change the page with it.
const LAST_UPDATED = '2026-09-28';

type MessageKey = ParseKeys<'translation'>;

interface Processor {
  name: string;
  url: string;
  label: MessageKey;
}

// Optional processors are listed only while they are switched on: the policy
// must not disclose a processor that is not in use, nor omit one that is.
const PLAUSIBLE: Processor = {
  name: 'Plausible Analytics',
  url: 'https://plausible.io/privacy',
  label: 'legal.processor.analytics',
};
const STRIPE: Processor = {
  name: 'Stripe',
  url: 'https://stripe.com/privacy',
  label: 'payments.legal.processor',
};

export function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const analytics = isAnalyticsEnabled();
  const payments = isPaymentsEnabled();
  // Never a mailto: with no address — that renders "write to ." and a dead
  // link. The placeholder is visible on purpose, next to the notConfigured
  // banner, so nobody ships it unnoticed.
  const email = CONTACT_EMAIL || t('legal.emailNotSet');
  const mail = CONTACT_EMAIL ? <a href={`mailto:${CONTACT_EMAIL}`} /> : <em />;

  // [purpose, data, legal basis]. Literal keys, not built from strings: the
  // catalogs are typed, so a computed key would opt out of the check that
  // catches a rename. Add a row for every new kind of personal data.
  const purposes = [
    ['legal.purpose.account', 'legal.purpose.accountData', 'legal.basisContract'],
    ...(analytics
      ? ([['legal.purpose.analytics', 'legal.purpose.analyticsData', 'legal.basisLegitimate']] as const)
      : []),
    ...(payments
      ? ([['payments.legal.purpose', 'payments.legal.purposeData', 'payments.legal.basis']] as const)
      : []),
  ] as const;

  const retention = [
    ['legal.retention.account', 'legal.retention.accountValue'],
    ...(analytics ? ([['legal.retention.analytics', 'legal.retention.analyticsValue']] as const) : []),
    ...(payments ? ([['payments.legal.retention', 'payments.legal.retentionValue']] as const) : []),
  ] as const;

  const processors: Processor[] = [
    ...PROCESSORS.map((p) => ({
      name: p.name,
      url: p.url,
      label: `legal.processor.${p.purposeKey}` as const,
    })),
    ...(analytics ? [PLAUSIBLE] : []),
    ...(payments ? [STRIPE] : []),
  ];

  return (
    <main className="legal-page">
      <h1>{t('legal.privacyTitle')}</h1>
      <p className="legal-updated">{t('legal.privacyUpdated', { date: LAST_UPDATED })}</p>

      {!isLegalConfigured() && <Alert type="warning">{t('legal.notConfigured')}</Alert>}

      <section aria-labelledby="controller">
        <h2 id="controller">{t('legal.controllerHeading')}</h2>
        <p>
          <Trans
            i18nKey="legal.controllerBody"
            values={{ email }}
            components={{ mail, legal: <Link to="/legal" /> }}
          />
        </p>
      </section>

      <section aria-labelledby="purposes">
        <h2 id="purposes">{t('legal.purposesHeading')}</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>{t('legal.purposeColumn')}</th>
              <th>{t('legal.dataColumn')}</th>
              <th>{t('legal.basisColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {purposes.map(([purpose, data, basis]) => (
              <tr key={purpose}>
                <td>{t(purpose)}</td>
                <td>{t(data)}</td>
                <td>{t(basis)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="retention">
        <h2 id="retention">{t('legal.retentionHeading')}</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>{t('legal.retentionCategory')}</th>
              <th>{t('legal.retentionDuration')}</th>
            </tr>
          </thead>
          <tbody>
            {retention.map(([category, value]) => (
              <tr key={category}>
                <td>{t(category)}</td>
                <td>{t(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="processors">
        <h2 id="processors">{t('legal.processorsHeading')}</h2>
        <p>{t('legal.processorsBody')}</p>
        <ul className="legal-processors">
          {processors.map((processor) => (
            <li key={processor.name}>
              <a href={processor.url} target="_blank" rel="noreferrer noopener">
                {processor.name}
              </a>{' '}
              — {t(processor.label)}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="storage">
        <h2 id="storage">{t('legal.storageHeading')}</h2>
        <p>{t('legal.storageBody')}</p>
      </section>

      <section aria-labelledby="rights">
        <h2 id="rights">{t('legal.rightsHeading')}</h2>
        <p>
          <Trans i18nKey="legal.rightsBody" values={{ email }} components={{ mail }} />
        </p>
      </section>

      <section aria-labelledby="complaint">
        <h2 id="complaint">{t('legal.complaintHeading')}</h2>
        <p>
          {SUPERVISORY_AUTHORITY.name ? (
            <Trans
              i18nKey="legal.complaintBody"
              values={{ authority: SUPERVISORY_AUTHORITY.name }}
              components={{
                authority: (
                  <a href={SUPERVISORY_AUTHORITY.url} target="_blank" rel="noreferrer noopener" />
                ),
              }}
            />
          ) : (
            t('legal.complaintBodyGeneric')
          )}
        </p>
      </section>
    </main>
  );
}
