export const validation = {
  displayName: {
    required: 'Le nom affiché est obligatoire.',
    tooShort: 'Le nom affiché doit contenir au moins {{min}} caractères.',
    tooLong: 'Le nom affiché ne peut pas dépasser {{max}} caractères.',
  },
} as const;
