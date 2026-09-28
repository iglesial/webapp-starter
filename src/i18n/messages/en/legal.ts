// Legal notice (/legal) and privacy policy (/privacy). Identity data (names,
// addresses, numbers) lives in src/data/legalEntity.ts, not here.
//
// This copy is a STARTING POINT, not legal advice. Before launch, make the
// privacy policy describe what your app actually collects, why, for how long
// and who else sees it — every model, processor and tracker you add is a
// change to this file.
export const legal = {
  footerNav: 'Legal information',
  legalNoticeLink: 'Legal notice',
  privacyLink: 'Privacy',
  emailNotSet: '[contact address not set]',
  notConfigured:
    'This page is still a template: the site publisher has not filled in its legal details yet.',

  noticeTitle: 'Legal notice',
  publisherHeading: 'Site publisher',
  publisherName: 'Name',
  publisherForm: 'Legal form',
  publisherAddress: 'Address',
  publisherRegistration: 'Registration',
  publisherDirector: 'Publication director',
  publisherVat: 'VAT',
  publisherPhone: 'Telephone',

  contactHeading: 'Contact',
  contactBody: 'For any question, write to us at <mail>{{email}}</mail>.',

  hostingHeading: 'Hosting',
  hostingBody: 'This site is hosted by {{name}}, {{address}}.',
  hostingRegion: 'Data is stored in the {{region}} region.',
  hostingContact: 'The host can be contacted through <host>its contact page</host>.',

  ipHeading: 'Intellectual property',
  ipBody:
    'The content of this site — text, images, graphics and software — is protected by intellectual property law. Any reproduction without prior written permission is prohibited.',

  dataHeading: 'Personal data',
  dataBody: 'How we handle your data is set out in our <privacy>privacy policy</privacy>.',

  privacyTitle: 'Privacy policy',
  privacyUpdated: 'Last updated: {{date}}',

  controllerHeading: 'Data controller',
  controllerBody:
    'The controller of your personal data is the site publisher named in the <legal>legal notice</legal>. For any question about your data, write to <mail>{{email}}</mail>.',

  purposesHeading: 'What we process, and why',
  purposeColumn: 'Purpose',
  dataColumn: 'Data',
  basisColumn: 'Legal basis',
  basisContract: 'Performance of the contract',
  basisLegitimate: 'Legitimate interest',
  purpose: {
    account: 'Account and sign-in',
    accountData: 'Email address, display name, preferred language, role',
    analytics: 'Audience measurement',
    analyticsData: 'Page views, referrer, campaign parameters — aggregated and cookieless',
  },

  retentionHeading: 'How long we keep it',
  retentionCategory: 'Category',
  retentionDuration: 'Duration',
  retention: {
    account: 'Account',
    accountValue: 'Until you delete your account, which you can do at any time',
    analytics: 'Audience measurement',
    analyticsValue: 'Aggregate counts only; nothing is linked to you',
  },

  processorsHeading: 'Recipients',
  processorsBody: 'We rely on the following providers, acting on our instructions:',
  processor: {
    hosting: 'Hosting and infrastructure',
    analytics: 'Audience measurement',
  },

  storageHeading: 'Cookies and local storage',
  storageBody:
    'We use no advertising cookies and no marketing trackers. Stored on your device are your preferred language and the tokens your session needs to keep you signed in. Both are strictly necessary, so no consent is required.',

  rightsHeading: 'Your rights',
  rightsBody:
    'You have the right to access, rectify, erase, restrict, port and object to the processing of your data. You can delete your account yourself from your profile page. To exercise any other right, write to <mail>{{email}}</mail>. We reply within one month and may need to verify your identity.',

  complaintHeading: 'Complaints',
  complaintBody:
    'You may lodge a complaint with the <authority>{{authority}}</authority>. You do not have to contact us first.',
  complaintBodyGeneric:
    'You may lodge a complaint with the data protection authority of the country where you live or work. You do not have to contact us first.',
} as const;
