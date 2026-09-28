// Account deletion (/profile). `deletedList` must describe what
// amplify/functions/account/deleteAccountData.ts actually deletes: if your app
// keeps anything after deletion (proof of purchase, say), add a sentence
// saying so — nobody should learn the limits after pressing the button.
export const account = {
  heading: 'Delete my account',
  intro: 'Deletion is permanent. You will see exactly what is erased before you confirm.',
  open: 'Delete my account…',
  dialogTitle: 'Delete your account?',
  deletedList:
    'Erased: your account (email address, display name, language) and everything stored with it. This cannot be undone.',
  confirm: 'I understand that this deletion is permanent.',
  submit: 'Delete permanently',
  deleting: 'Deleting…',
  deletedToast: 'Your account has been deleted.',
} as const;
