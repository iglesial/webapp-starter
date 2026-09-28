// Suppression de compte (/profile). Voir la note dans ../en/account.ts :
// `deletedList` doit décrire ce que le Lambda supprime réellement.
export const account = {
  heading: 'Supprimer mon compte',
  intro:
    'La suppression est définitive. Vous verrez exactement ce qui est effacé avant de confirmer.',
  open: 'Supprimer mon compte…',
  dialogTitle: 'Supprimer votre compte ?',
  deletedList:
    'Seront effacés : votre compte (adresse e-mail, nom affiché, langue) et tout ce qui y est rattaché. Cette action est irréversible.',
  confirm: 'Je comprends que cette suppression est définitive.',
  submit: 'Supprimer définitivement',
  deleting: 'Suppression…',
  deletedToast: 'Votre compte a été supprimé.',
} as const;
