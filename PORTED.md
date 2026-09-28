# What came from ai-upskill

Most of this template was ported, generalized and hardened from [ai-upskill](https://github.com/iglesial/ai-upskill), a production app built on the original version of this template. The two repositories share no git history, so changes can't be cherry-picked. This file records what came from where, so a later sync can see what changed upstream since.

**Sync point:** ai-upskill `dev` at **`b4a3420`** (2026-09-28). The ports were made that day from branch `85-beta-access`, which merged as that commit.

To find upstream changes worth porting since then:

```bash
git -C ../ai-upskill log --oneline b4a3420..dev -- \
  src/i18n src/components/core src/components/layout src/components/learn \
  src/components/presentations src/hooks src/utils amplify/functions/shared \
  amplify/functions/account amplify/functions/post-confirmation \
  amplify/functions/payments amplify/functions/stripe-webhook amplify/storage \
  eslint.config.js vite.config.ts playwright.config.ts amplify.yml package.json
```

## Ported, by template PR

| PR | Template location | From ai-upskill | How it changed |
|---|---|---|---|
| #1 | toolchain, `amplify.yml`, `playwright.config.ts`, CI, `npm run synth` | same files | Playwright on a strict port 5199. Synth runs in CI. |
| #3 | `src/i18n/`, `LocaleProvider`, `LocaleToggle`, `src/test/i18n.ts` | same | English is the default. `formatPrice` takes a currency. Domain namespaces dropped. `AFTER_SIGN_IN_PATH` added. The language save-failure warning is now shown. |
| #4 | `src/components/layout/`, core `Checkbox`/`FileInput`/`Switch`/`Toast`, `designTokens.test.ts`, admin home | same | Links and brand made generic. `--on-*` contrast tokens and a contrast test added. Spinner, Hero and Modal bugs fixed. |
| #5 | `amplify/functions/{account,post-confirmation,shared}`, `DeleteAccountSection` | same | The deletion cascade became the `ACCOUNT_CLEANUPS` list, with the certificate logic dropped. Synth now fails on circular dependencies. |
| #6 | `amplify/storage`, `uploadService`, `useStorageUrl`, `awsJson`, `imageValidation`, `imageResize` | `thumbnailService` and the same helpers | Prefixes became `public/` and `members/`. Generic `uploadImage(prefix, name, file)`. |
| #7 | `/legal`, `/privacy`, `src/data/legalEntity.ts`, `analytics.ts` | `LegalNoticePage`, `PrivacyPolicyPage`, `legalEntity.ts`, Plausible init | **All identity data removed**, along with the French-law specifics (mediator, CGV, proctoring). Shows a "not configured" banner until filled in. |
| #8 | `src/modules/markdown/` | `components/learn/Markdown.tsx`, `lessonDirectives.ts`, video and callout widgets | Allowlist cut to `video` and `callout`. Figure widgets dropped. |
| #9 | `src/modules/payments/`, `amplify/modules/payments/` | `functions/payments`, `functions/stripe-webhook`, the checkout pages | Generic products priced by Stripe `lookup_key`. **Off by default** (`PAYMENTS_ENABLED`). Tracks, exams, the withdrawal waiver and partner referral dropped. |
| #10 | `src/modules/presentations/` | `components/presentations/`, `useSlideNavigation` | Chrome moved to i18n. A deck registry added. ai-upskill's slides replaced by an example deck. |

## Deliberately not ported

- **The course domain:** exam, proctoring (AutoProctor), learn and lessons, tracks, dashboard, questions and CSV import, certificates, beta access, retention rules, and the `scripts/build-*` tooling.
- **Partner referral discounts:** left out of the payments module by decision. The `partner-referral-discount` skill covers it.
- **ai-upskill's legal content and publisher identity.**
- **AI and process tooling** (`.claude/skills`, `.specify`, `.packmind`): distributed through Packmind when a repo is created. The exception is this template's own `webapp-starter` skill, which lives here because it describes this repo.

## Fixes made here that ai-upskill may want back

- **`npm run synth`** must pass `--context @aws-cdk/core:validateAgainstDefaultRules=true`. Without it, a circular dependency is only a warning (fixed in ai-upskill too).
- **`designTokens.test.ts` contrast check.** White text on themed fills failed WCAG AA.
