export const errors = {
  // Generic fallback for unexpected errors (log them with console.error).
  unknown: 'Une erreur est survenue. Veuillez réessayer.',
  account: {
    ACCOUNT_DELETE_FAILED:
      'La suppression n’a pas abouti. Veuillez réessayer : l’opération reprend là où elle s’est arrêtée.',
  },
  auth: {
    signIn: {
      INVALID_CREDENTIALS: {
        title: 'Échec de la connexion.',
        body: 'Votre e-mail et votre mot de passe ne correspondent à aucun compte. Veuillez réessayer.',
      },
      RATE_LIMITED_TRY_LATER: {
        title: 'Trop de tentatives.',
        body: 'Veuillez patienter un instant avant de réessayer.',
      },
      default: {
        title: 'Nous n’avons pas pu vous connecter.',
        body: 'Veuillez réessayer.',
      },
    },
    signUp: {
      EMAIL_ALREADY_REGISTERED: {
        title: 'Cet e-mail est déjà enregistré.',
        body: 'Essayez de vous connecter, ou réinitialisez votre mot de passe si vous l’avez oublié.',
      },
      PASSWORD_DOES_NOT_MEET_POLICY: {
        title: 'Mot de passe trop faible.',
        body: 'Au moins 10 caractères, avec des majuscules, des minuscules et un chiffre.',
      },
      RATE_LIMITED_TRY_LATER: {
        title: 'Trop de tentatives.',
        body: 'Veuillez patienter un instant avant de réessayer.',
      },
      default: {
        title: 'Nous n’avons pas pu créer votre compte.',
        body: 'Veuillez vérifier vos informations et réessayer.',
      },
    },
    confirmSignUp: {
      VERIFICATION_CODE_INVALID: {
        title: 'Ce code ne correspond pas.',
        body: 'Vérifiez le code reçu par e-mail et réessayez.',
      },
      VERIFICATION_CODE_EXPIRED: {
        title: 'Ce code a expiré.',
        body: 'Demandez un nouveau code — le précédent n’est plus valide.',
      },
      default: {
        title: 'Nous n’avons pas pu confirmer votre compte.',
        body: 'Veuillez réessayer ou demander un nouveau code.',
      },
    },
    forgotPassword: {
      RATE_LIMITED_TRY_LATER: {
        title: 'Trop de tentatives.',
        body: 'Veuillez patienter un instant avant de réessayer.',
      },
      default: {
        title: 'Nous n’avons pas pu lancer la réinitialisation.',
        body: 'Veuillez réessayer.',
      },
    },
    confirmReset: {
      VERIFICATION_CODE_INVALID: {
        title: 'Ce code ne correspond pas.',
        body: 'Vérifiez le code reçu par e-mail.',
      },
      VERIFICATION_CODE_EXPIRED: {
        title: 'Ce code a expiré.',
        body: 'Demandez un nouveau code de réinitialisation ci-dessous.',
      },
      PASSWORD_DOES_NOT_MEET_POLICY: {
        title: 'Mot de passe trop faible.',
        body: 'Au moins 10 caractères, avec des majuscules, des minuscules et un chiffre.',
      },
      RATE_LIMITED_TRY_LATER: {
        title: 'Trop de tentatives.',
        body: 'Veuillez patienter un instant avant de réessayer.',
      },
      default: {
        title: 'Nous n’avons pas pu réinitialiser votre mot de passe.',
        body: 'Veuillez réessayer.',
      },
    },
  },
} as const;
