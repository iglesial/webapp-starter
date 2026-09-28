// Who publishes this site, and who processes its users' data. Fill this in
// before launch — the legal notice and privacy policy render from it.
//
// A constants module rather than the i18n catalogs on purpose: a company name
// or a postal address reads the same in every language, and catalog.test.ts
// fails long French strings identical to their English counterpart. Names
// and addresses are DATA; the sentences around them are copy.
//
// Every field left empty renders NOTHING rather than a placeholder — a missing
// line is better than a guessed one, and a wrong registration number is worse
// than none. Until the required fields are filled, both pages show a visible
// "not configured" notice (see isLegalConfigured).
//
// What the notice must contain depends on where you operate. In France (LCEN
// art. 6 III) a company needs its name, legal form, registered address,
// registration number, publication director, a phone number and an email, plus
// the host's name, address and phone. Check your own jurisdiction.

export const CONTACT_EMAIL = '';

export const LEGAL_ENTITY = {
  /** Company name — or, for a sole trader, the person's full name. */
  name: '',
  /** e.g. "SAS au capital de 1 000 €", "Entrepreneur individuel (EI)", "Ltd". */
  legalForm: '',
  address: '',
  /** Company registration, e.g. "SIREN 123 456 789 — RCS Paris" or "Company no. 01234567". */
  registration: '',
  /** The person legally responsible for the site's content. */
  publicationDirector: '',
  /** Optional: EU VAT number, or the exemption mention if you have none. */
  vat: '',
  /** Optional in some countries, required in others (France: required). */
  phone: '',
} as const;

// The fields without which the legal notice is not a legal notice.
const REQUIRED: (keyof typeof LEGAL_ENTITY)[] = ['name', 'address', 'publicationDirector'];

export function isLegalConfigured(): boolean {
  return Boolean(CONTACT_EMAIL) && REQUIRED.every((field) => Boolean(LEGAL_ENTITY[field]));
}

// Amplify Hosting runs on AWS. For customers in the EU/EEA the contracting
// entity is Amazon Web Services EMEA SARL (check your AWS invoice — elsewhere
// it is usually Amazon Web Services, Inc.). Set `region` to where your app is
// actually deployed; never claim a country you have not checked.
export const HOSTING_PROVIDER = {
  name: 'Amazon Web Services EMEA SARL',
  address: '38 avenue John F. Kennedy, L-1855 Luxembourg',
  /** e.g. "eu-west-1 (Ireland)". Left empty, the region is not mentioned. */
  region: '',
  url: 'https://aws.amazon.com/contact-us/',
} as const;

// Every third party that processes personal data on your behalf, named in the
// privacy policy. Add one entry per processor you integrate (payments, email,
// support…), with a matching `legal.processor.*` catalog key.
export const PROCESSORS = [
  { name: 'Amazon Web Services', purposeKey: 'hosting', url: 'https://aws.amazon.com/privacy/' },
] as const satisfies readonly { name: string; purposeKey: string; url: string }[];

// Where a user may complain. For France: CNIL, https://www.cnil.fr. Left empty,
// the policy points to "your national data protection authority" instead.
export const SUPERVISORY_AUTHORITY = {
  name: '',
  url: '',
} as const;
