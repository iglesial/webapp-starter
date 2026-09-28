// Mentions légales (/legal) et politique de confidentialité (/privacy).
// Voir la note dans ../en/legal.ts : ce texte est un point de départ, pas un
// conseil juridique.
export const legal = {
  footerNav: 'Informations légales',
  legalNoticeLink: 'Mentions légales',
  privacyLink: 'Confidentialité',
  emailNotSet: '[adresse de contact non renseignée]',
  notConfigured:
    'Cette page est encore un modèle : l’éditeur du site n’a pas encore renseigné ses informations légales.',

  noticeTitle: 'Mentions légales',
  publisherHeading: 'Éditeur du site',
  publisherName: 'Nom',
  publisherForm: 'Forme juridique',
  publisherAddress: 'Adresse',
  publisherRegistration: 'Immatriculation',
  publisherDirector: 'Directeur de la publication',
  publisherVat: 'TVA',
  publisherPhone: 'Téléphone',

  contactHeading: 'Contact',
  contactBody: 'Pour toute question, écrivez-nous à <mail>{{email}}</mail>.',

  hostingHeading: 'Hébergement',
  hostingBody: 'Ce site est hébergé par {{name}}, {{address}}.',
  hostingRegion: 'Les données sont stockées dans la région {{region}}.',
  hostingContact: 'L’hébergeur peut être contacté via <host>sa page de contact</host>.',

  ipHeading: 'Propriété intellectuelle',
  ipBody:
    'Le contenu de ce site — textes, images, graphismes et logiciels — est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation écrite préalable est interdite.',

  dataHeading: 'Données personnelles',
  dataBody:
    'Le traitement de vos données est décrit dans notre <privacy>politique de confidentialité</privacy>.',

  privacyTitle: 'Politique de confidentialité',
  privacyUpdated: 'Dernière mise à jour : {{date}}',

  controllerHeading: 'Responsable du traitement',
  controllerBody:
    'Le responsable du traitement de vos données personnelles est l’éditeur du site désigné dans les <legal>mentions légales</legal>. Pour toute question sur vos données, écrivez à <mail>{{email}}</mail>.',

  purposesHeading: 'Ce que nous traitons, et pourquoi',
  purposeColumn: 'Finalité',
  dataColumn: 'Données',
  basisColumn: 'Base légale',
  basisContract: 'Exécution du contrat',
  basisLegitimate: 'Intérêt légitime',
  purpose: {
    account: 'Compte et connexion',
    accountData: 'Adresse e-mail, nom affiché, langue préférée, rôle',
    analytics: 'Mesure d’audience',
    analyticsData:
      'Pages vues, site de provenance, paramètres de campagne — agrégés et sans cookie',
  },

  retentionHeading: 'Durée de conservation',
  retentionCategory: 'Catégorie',
  retentionDuration: 'Durée',
  retention: {
    account: 'Compte',
    accountValue:
      'Jusqu’à la suppression de votre compte, que vous pouvez effectuer à tout moment',
    analytics: 'Mesure d’audience',
    analyticsValue: 'Uniquement des totaux agrégés ; rien n’est rattaché à vous',
  },

  processorsHeading: 'Destinataires',
  processorsBody: 'Nous faisons appel aux prestataires suivants, qui agissent sur nos instructions :',
  processor: {
    hosting: 'Hébergement et infrastructure',
    analytics: 'Mesure d’audience',
  },

  storageHeading: 'Cookies et stockage local',
  storageBody:
    'Nous n’utilisons aucun cookie publicitaire ni traceur marketing. Sont conservés sur votre appareil votre langue préférée et les jetons nécessaires à votre session pour vous garder connecté. Ils sont strictement nécessaires : aucun consentement n’est requis.',

  rightsHeading: 'Vos droits',
  rightsBody:
    'Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, de portabilité et d’opposition. Vous pouvez supprimer votre compte vous-même depuis votre page de profil. Pour exercer tout autre droit, écrivez à <mail>{{email}}</mail>. Nous répondons dans un délai d’un mois et pouvons être amenés à vérifier votre identité.',

  complaintHeading: 'Réclamations',
  complaintBody:
    'Vous pouvez introduire une réclamation auprès de la <authority>{{authority}}</authority>. Vous n’êtes pas tenu de nous contacter au préalable.',
  complaintBodyGeneric:
    'Vous pouvez introduire une réclamation auprès de l’autorité de protection des données du pays où vous vivez ou travaillez. Vous n’êtes pas tenu de nous contacter au préalable.',
} as const;
