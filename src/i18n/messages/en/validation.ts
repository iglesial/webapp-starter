export const validation = {
  displayName: {
    required: 'Display name is required.',
    tooShort: 'Display name must be at least {{min}} characters.',
    tooLong: 'Display name must be at most {{max}} characters.',
  },
} as const;
