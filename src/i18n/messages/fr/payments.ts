export const payments = {
  products: {
    pro: {
      name: 'Pro',
      description: 'Tout le plan gratuit, plus les fonctionnalités Pro. Achat unique.',
    },
  },
  checkout: {
    title: 'Paiement',
    buy: 'Procéder au paiement',
    redirecting: 'Redirection vers Stripe…',
    secure: 'Le paiement est traité de façon sécurisée par Stripe. Nous ne voyons jamais vos données de carte.',
    alreadyOwned: 'Vous possédez déjà ce produit.',
    notFound: 'Ce produit n’existe pas.',
  },
  success: {
    title: 'Merci',
    activating: 'Paiement reçu — activation de votre achat…',
    done: 'Votre achat est actif.',
    slow: 'Votre paiement est bien passé, mais l’activation prend plus de temps que d’habitude. Elle apparaîtra d’elle-même sous peu ; si ce n’est pas le cas d’ici quelques minutes, contactez-nous.',
    continue: 'Continuer',
  },
  errors: {
    PAY_NOT_FOUND: 'Ce produit n’existe pas.',
    PAY_NOT_CONFIGURED: 'Ce produit ne peut pas encore être acheté.',
    PAY_ALREADY_ENTITLED: 'Vous possédez déjà ce produit.',
    PAY_UNKNOWN: 'Le paiement n’a pas pu être lancé. Veuillez réessayer.',
  },
  legal: {
    purpose: 'Paiement',
    purposeData:
      'Ce que vous avez acheté et quand, et la référence du paiement Stripe. Nous ne voyons jamais vos données de carte.',
    basis: 'Exécution du contrat',
    retention: 'Preuve d’achat',
    retentionValue:
      'Aussi longtemps que la loi l’exige (comptabilité et litiges), y compris après la suppression du compte',
    processor: 'Traitement des paiements',
    accountKept: 'Conservée : la preuve de vos achats, comme la loi l’exige.',
  },
} as const;
