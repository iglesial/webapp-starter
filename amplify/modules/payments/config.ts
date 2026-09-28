// The payments module is OFF unless PAYMENTS_ENABLED=true at synth time
// (an Amplify branch environment variable, or set in your shell before
// `npx ampx sandbox`).
//
// Off by default because its functions read Stripe keys with secret(), and a
// backend referencing a secret nobody has set fails to deploy. Switched off,
// none of the module's resources exist, so a new project deploys with zero
// setup. See src/modules/payments/README.md for the switch-on checklist.
//
// Read through globalThis because the browser build type-checks this file too
// (the frontend imports the Schema TYPE), and it has no Node types. At synth
// time it is plain process.env.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env;
export const PAYMENTS_ENABLED = env?.PAYMENTS_ENABLED === 'true';
