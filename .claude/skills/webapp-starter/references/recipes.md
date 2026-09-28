# Recipes

Step-by-step checklists for changes that span several files. Each ends with the gates from SKILL.md's "Definition of done"; they aren't repeated every time.

1. [Add a page](#1-add-a-page)
2. [Add translated copy or a new catalog surface](#2-add-translated-copy-or-a-new-catalog-surface)
3. [Add a data model that stores per-user data](#3-add-a-data-model-that-stores-per-user-data)
4. [Add a Lambda-backed mutation](#4-add-a-lambda-backed-mutation)
5. [Add an image upload](#5-add-an-image-upload)
6. [Add an admin section](#6-add-an-admin-section)
7. [Add a coded error family](#7-add-a-coded-error-family)
8. [Switch on payments, or add a product](#8-switch-on-payments-or-add-a-product)
9. [Add a slide deck](#9-add-a-slide-deck)
10. [Remove an optional module](#10-remove-an-optional-module)
11. [Add a core UI component](#11-add-a-core-ui-component)

---

## 1. Add a page

1. **Component.** Add `src/pages/FooPage.tsx`, `FooPage.css` and `FooPage.test.tsx`. Wrap the content in `<main className="foo-page">`; `AppShell` provides the navbar and footer. Build forms from `src/components/core/`, never from `@aws-amplify/ui-react`.
2. **Copy.** Create a `foo` surface in both catalogs (recipe 2) and use `t('foo.…')` for every visible string.
3. **Route** in `src/App.tsx`, *inside* the `<Route element={<AppShell />}>` layout route:
   - **Public:** `<Route path="/foo" element={<FooPage />} />`.
   - **Signed-in:** wrap the element in `<ProtectedRoute>`.
   - **Admin:** nest it under the `/admin` route instead (recipe 6).
   - **Full-screen** (no navbar or footer, like decks): put it *outside* the layout route.
4. **Lazy-load it** with `React.lazy` and `<Suspense fallback={<Spinner size="large" />}>` if it imports a data service (`aws-amplify/data` is heavy) or most visitors never open it. `/profile` in `App.tsx` shows the pattern: a named-export shim, created at module level.
5. **Navigation.** If it needs a link, `src/components/layout/Navbar.tsx` has **two** lists, desktop (`navbar-nav`) and mobile (`navbar-mobile-list`); add it to both, with a `nav.*` key. For the landing destination after sign-in, change `AFTER_SIGN_IN_PATH` in `src/config/routes.ts`.
6. **Docs.** Update the Routes lists in `CLAUDE.md` and the README.
7. **Test.** Cover behaviour: what the page does, where its links go, what happens on error. Add a Playwright spec in `e2e/` if it's a user journey.

## 2. Add translated copy or a new catalog surface

- **The English catalog defines the shape.** `src/i18n/messages/en/<surface>.ts` ends in `as const`. `fr/<surface>.ts` mirrors it, and `fr/index.ts` types the whole French catalog against the English one, so a missing French key is a compile error.
- **New surface:**
  1. Create `en/foo.ts` and `fr/foo.ts` with the same shape.
  2. Import and add `foo` in **both** `index.ts` files.
- **Markup inside a sentence:** use `<Trans i18nKey="foo.body" components={{ link: <Link to="/x" /> }} />` with `<link>…</link>` in the string. Never split one sentence across several keys: French word order differs.
- **Interpolation** is `{{name}}`. Values go through `t()`'s second argument, so a formatted price comes from `useLocale().formatPrice`, never string concatenation.
- **Identical strings.** `catalog.test.ts` fails on a French string over 12 characters that equals its English one. Add a key to `IDENTICAL_BY_DESIGN` only when it's genuinely the same, like a product name.
- **Not everything is copy:**
  - the admin back-office (`src/pages/admin/`) stays English, with no `t()`;
  - identity data (names, addresses) belongs in `src/data/legalEntity.ts`;
  - slide text belongs under `src/modules/presentations/decks/`.

## 3. Add a data model that stores per-user data

This is the change most often left half-done. Every step is needed; account deletion and the privacy policy are the ones people forget.

1. **Decide who writes it.** If a user could gain something by forging a row (access, money, a certificate), write it **only from a Lambda** (recipe 4) and make it read-only for owners. Otherwise the client may write it.
2. **Schema** in `amplify/data/resource.ts`:
   ```ts
   Note: a
     .model({
       // The Cognito sub. Its own rule leaves out 'update': otherwise an owner
       // could set ownerId to someone else's sub and hand them the row.
       ownerId: a
         .string()
         .authorization((allow) => [
           allow.ownerDefinedIn('ownerId').identityClaim('sub').to(['create', 'read', 'delete']),
         ]),
       body: a.string().required(),
     })
     .authorization((allow) => [allow.ownerDefinedIn('ownerId').identityClaim('sub')])
     .secondaryIndexes((index) => [index('ownerId')]),   // → listNoteByOwnerId
   ```
   - Use an explicit owner field with `identityClaim('sub')`. AppSync fills and enforces it on create, and the index gives account deletion a real query instead of a table scan. This exact shape is checked to typecheck and synth.
   - **Fields rendered as links** (`a.url()` accepts `javascript:`) need an `http:`/`https:` allowlist in client validation *and* at render time, so a bad stored value shows as text, never as a clickable `href`.
   - For a Lambda-written model, restrict owners with `.to(['read'])`.
   - Default auth is the user pool. Public (signed-out) reads need an API-key authorization mode added to `defineData` first. Keep private fields off any publicly readable model entirely, because a public model exposes every field it has.
3. **Service** in `src/services/data/noteService.ts`:
   - use `dataClient` from `./client` with `{ authMode: 'userPool' }`;
   - page with `nextToken`;
   - throw coded errors (recipe 7), never raw messages.

   Colocate `noteService.test.ts` and mock `./client`.
4. **Account deletion.** Add a `Note` entry to `ACCOUNT_CLEANUPS` in `amplify/functions/account/deleteAccountData.ts`; the comment there has this exact example. Use `collectAll` + `throwOnErrors`, and put children before parents.
   - Then update `deleteAccountData.test.ts`. Its first test fails on purpose once the list is non-empty; change it to assert the names you expect.
   - If the data must *survive* deletion (proof of purchase, say), don't list it. Add a sentence to `account.deletedList` saying it's kept.
5. **Privacy policy** in `src/pages/PrivacyPolicyPage.tsx`:
   - add a row to `purposes` (purpose, data, legal basis) and to `retention`, with `legal.purpose.*` and `legal.retention.*` keys in **both** `legal.ts` catalogs;
   - if a third party processes it, add it to `PROCESSORS` in `src/data/legalEntity.ts` with a `legal.processor.*` key;
   - bump `LAST_UPDATED`.
6. **`a.json()` fields** carry a JSON *string*: write them with `toAwsJson` and read them with `fromAwsJson`.
7. **Check it.** `npm run synth`, then exercise it in `npx ampx sandbox`: create a row, read it as its owner, confirm another user can't, then delete the account and confirm the row is gone.

## 4. Add a Lambda-backed mutation

Use this for anything the client must not be trusted with: prices, grants, cross-user reads, third-party secrets.

1. **Function.** Add `amplify/functions/foo/resource.ts` with `defineFunction({ name: 'foo', entry: './handler.ts', timeoutSeconds: 30 })`:
   - secrets it can't work without: `environment: { KEY: secret('KEY') }`;
   - values whose absence should degrade quietly: branch env vars added in `backend.ts`.
2. **Handler.** Copy the shape of `amplify/functions/account/handler.ts`:
   - `switch (fieldNameOf(event))`;
   - identity via `identityOf(event)`, **never** from `event.arguments`;
   - `throwOnErrors()` after every data call;
   - failures thrown as a code string from a `*_ERROR_CODES` constant (recipe 7).
3. **Data access** (only if needed). Add `client.ts` exporting `await createDataClient()` from `../shared/dataClient`, as `account/client.ts` does, so tests can mock it. Grant it with `allow.resource(foo)` in the **schema-level** `.authorization([...])` of `amplify/data/resource.ts`. That's full data access, so keep the function small.
4. **Schema:**
   ```ts
   FooResult: a.customType({ ok: a.boolean().required() }),
   doFoo: a.mutation()
     .arguments({ thing: a.string().required() })   // no user id, ever
     .returns(a.ref('FooResult'))
     .handler(a.handler.function(foo))
     .authorization((allow) => [allow.authenticated()]),
   ```
5. **Backend.** Add `foo` to `defineBackend({...})` in `amplify/backend.ts`. Grant AWS permissions to **this function only**, scoped to one resource ARN; see the `AdminDeleteUser` grant there.
6. **Cognito triggers only:** add `resourceGroupName: 'auth'`, or synth reports a circular dependency.
7. **Tests.** Add `handler.test.ts` beside the handler, mocking `./client` and any SDK (`vi.mock('stripe', …)`). Pin:
   - a token identity beats a smuggled argument;
   - an unauthenticated call touches nothing;
   - each coded refusal;
   - a failed write throws.
8. **Frontend.** Add a service calling `dataClient.mutations.doFoo(args, { authMode: 'userPool' })` and mapping codes to catalog keys.
9. **Check it.** `npm run synth`. Nothing else catches a bad policy or a circular dependency before deploy.

## 5. Add an image upload

1. **Choose the audience by prefix** (`STORAGE_PREFIX` in `src/services/uploadService.ts`, enforced by `amplify/storage/resource.ts`):
   - `public/` means anyone can read it, including signed-out visitors;
   - `members/` means signed-in users only;
   - only admins can write either.

   **User-uploaded files need a new per-user prefix** (`private/{entity_id}/*` with `allow.entity('identity')`), *and* a cleanup in account deletion that deletes those objects. That requires `s3:DeleteObject` on the prefix for the account function. Add both together or not at all.
2. **UI.** Use `<FileInput>` from core.
3. **Upload.** Call `validateImageFile(file)`, which returns a reason code; map it to catalog copy. Then call `uploadService.uploadImage(prefix, name, file)`, which resizes to WebP and returns `{ path, width, height }`.
4. **Store** the `path`, `width` and `height` on the owning record. Width and height let `<img>` reserve its space.
5. **Display** with `useStorageUrl(path)`, and render a placeholder while it returns `null`.
6. **Replacing an image:** upload the new one (it gets a fresh key), save the record, *then* call `uploadService.removeQuietly(oldPath)`, only if nothing else references the old key.

## 6. Add an admin section

1. **Page.** Add `src/pages/admin/AdminFooPage.tsx`. It's **English only** (no `useTranslation()`) and uses core components.
2. **Route.** Nest it under the existing `<Route path="/admin" element={<AdminOnlyRoute />}>` in `App.tsx`, as `<Route path="foo" element={…} />`, lazy-loaded like the admin home.
3. **Home card.** Add `{ to: '/admin/foo', title, description }` to `SECTIONS` in `src/pages/admin/AdminHomePage.tsx`.
4. **Data it writes:** grant `allow.group('admin')` on the model. The route guard only hides the page; the authorization rule is what protects the data.

## 7. Add a coded error family

1. **Codes.** Add `src/utils/fooErrors.ts`:
   ```ts
   export const FOO_ERROR_CODES = { notFound: 'FOO_NOT_FOUND', unknown: 'FOO_UNKNOWN' } as const;
   export type FooErrorCode = (typeof FOO_ERROR_CODES)[keyof typeof FOO_ERROR_CODES];
   ```
   Keep the file pure (no imports), so a Lambda can import it too.
2. **Lambda:** `throw new Error(FOO_ERROR_CODES.notFound)`.
3. **Service.** Match the code *inside* the AppSync message (`message.includes(code)`), because AppSync wraps it. Fall back to `unknown`, and `console.error` the original. `src/modules/payments/paymentService.ts` (`toPaymentError`) shows the pattern.
4. **Copy map.** Add `FOO_ERROR_KEY: Record<FooErrorCode, MessageKey>` to `src/i18n/serviceErrors.ts`, pointing at `errors.foo.*` keys in both catalogs. A new code without copy fails to compile.
5. **UI:** `<Alert type="danger">{t(FOO_ERROR_KEY[err.code])}</Alert>`. Never render `err.message`.

## 8. Switch on payments, or add a product

Read `src/modules/payments/README.md` first; it has the full checklist. The essentials:
- **Switching on:**
  1. In Stripe, create a price whose lookup key is the product slug.
  2. Set the `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` secrets.
  3. Set `PAYMENTS_ENABLED=true` and `APP_ORIGIN`.
  4. Deploy, register `custom.stripeWebhookUrl` as a Stripe webhook endpoint (**one per branch**), set its signing secret, and redeploy.
- **Adding a product:** add it to `PRODUCTS` in `src/modules/payments/products.ts` and its copy in `copy.ts` (the compiler enforces it) and both `payments.ts` catalogs. Then create its Stripe price in test *and* live mode.
- **Gating a feature on a purchase:** check `Entitlement` **server-side** in the Lambda that serves the paid thing. A client-side check only hides UI.
- **Legal:** consumer law may require an explicit withdrawal waiver before delivering digital content (the EU does). Raise it with the user; it isn't built in.

## 9. Add a slide deck

1. Copy `src/modules/presentations/decks/example/` to `decks/<slug>/`.
2. Register it in `src/modules/presentations/registry.ts` as `{ slug, title, subtitle, load: () => import('./decks/<slug>/Deck') }`.
3. Slides are components; `SlideDeck` passes them `isActive`. Use `className="stagger-item"` with `style={staggerStyle(i)}` for staggered entrances, and `presentation-card` for cards. Colours come from the design tokens.
4. Slide text is authored content: write it in the deck's language directly, with no catalog keys.
5. Check it at `/presentations/<slug>` in both themes. Keyboard: arrows, space, Home, End.

## 10. Remove an optional module

1. Follow the "Removing this module" steps in its README exactly. Each lists every file outside the module folder that references it, including the catalog `index.ts` entries and, for payments, the backend, the privacy page, the deletion dialog and CI.
2. Run the full gates. Then `grep -r "<module-name>" src amplify .github` should return nothing.
3. Remove its bullet from CLAUDE.md's "Optional modules" section, its line from the structure tree and the README, and uninstall its packages.

## 11. Add a core UI component

1. **Files.** Add `src/components/core/Foo.tsx`, `Foo.css` and `Foo.test.tsx`.
2. **i18n-free.** Take visible text as props (already translated by the caller). The only exception is a generic control label like "Close" or "Dismiss", via `common.*`.
3. **Styling.** Use design tokens only. Text on a filled background uses an `--on-*` token.
4. **Accessibility.** Use native elements where possible, and make the accessible name come from visible text. Test by role.
5. **Docs.** Document the props and an example in `src/components/core/README.md`.
