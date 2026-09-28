export const errors = {
  // Generic fallback for unexpected errors (log them with console.error).
  unknown: 'Something went wrong. Please try again.',
  auth: {
    signIn: {
      INVALID_CREDENTIALS: {
        title: 'Sign-in failed.',
        body: 'Your email and password did not match an account. Please try again.',
      },
      RATE_LIMITED_TRY_LATER: {
        title: 'Too many attempts.',
        body: 'Please wait a moment and try again.',
      },
      default: { title: 'We could not sign you in.', body: 'Please try again.' },
    },
    signUp: {
      EMAIL_ALREADY_REGISTERED: {
        title: 'That email is already registered.',
        body: 'Try signing in, or reset your password if you forgot it.',
      },
      PASSWORD_DOES_NOT_MEET_POLICY: {
        title: 'Password is too weak.',
        body: 'At least 10 characters, with upper- and lower-case letters and a number.',
      },
      RATE_LIMITED_TRY_LATER: {
        title: 'Too many attempts.',
        body: 'Please wait a moment and try again.',
      },
      default: {
        title: 'We could not create your account.',
        body: 'Please check your details and try again.',
      },
    },
    confirmSignUp: {
      VERIFICATION_CODE_INVALID: {
        title: 'That code does not match.',
        body: 'Double-check the code from your email and try again.',
      },
      VERIFICATION_CODE_EXPIRED: {
        title: 'That code has expired.',
        body: 'Request a new code — the last one is no longer valid.',
      },
      default: {
        title: 'We could not confirm your account.',
        body: 'Please try again or request a new code.',
      },
    },
    forgotPassword: {
      RATE_LIMITED_TRY_LATER: {
        title: 'Too many attempts.',
        body: 'Please wait a moment and try again.',
      },
      default: { title: 'We could not start the reset.', body: 'Please try again.' },
    },
    confirmReset: {
      VERIFICATION_CODE_INVALID: {
        title: 'That code does not match.',
        body: 'Double-check the code from your email.',
      },
      VERIFICATION_CODE_EXPIRED: {
        title: 'That code has expired.',
        body: 'Request a new reset code below.',
      },
      PASSWORD_DOES_NOT_MEET_POLICY: {
        title: 'Password is too weak.',
        body: 'At least 10 characters, with upper- and lower-case letters and a number.',
      },
      RATE_LIMITED_TRY_LATER: {
        title: 'Too many attempts.',
        body: 'Please wait a moment and try again.',
      },
      default: {
        title: 'We could not reset your password.',
        body: 'Please try again.',
      },
    },
  },
} as const;
