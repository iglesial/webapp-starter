# Component Library

This directory contains the base component library for Fluffy Cake. All components follow consistent design patterns and use the global CSS variables defined in `src/index.css`.

## Available Components

### Button
Button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `fullWidth`: boolean (default: false)
- Extends all standard HTML button attributes

**Example:**
```tsx
<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>
```

### Input
Input component with error handling and validation display.

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' (default: 'text')
- `error`: string (optional error message)
- `fullWidth`: boolean (default: false)
- Extends all standard HTML input attributes

**Example:**
```tsx
<Input
  type="email"
  placeholder="Enter email"
  error="Invalid email format"
/>
```

### Textarea
Multiline text input component with error handling.

**Props:**
- `error`: string (optional error message)
- `fullWidth`: boolean (default: false)
- Extends all standard HTML textarea attributes (rows, maxLength, placeholder, etc.)

**Example:**
```tsx
<Textarea
  placeholder="Enter your message..."
  rows={4}
  maxLength={500}
  error="Message is required"
/>
```

### FileInput
File picker with a styled button. The native input cannot be styled, so it is
visually hidden (not `display: none`, which would make it unfocusable) and a
`<label>` acts as the button. Exists because `Input` deliberately excludes
`type="file"` from its `type` union.

**Props:**
- `id`: string (required — links the label to the input)
- `accept`: string (MIME types or extensions)
- `label`: string (the button text)
- `hint`: string (optional — shown beside the button, e.g. the chosen filename)
- `disabled`: boolean
- `onSelect`: `(file: File | null) => void`

**Example:**
```tsx
<FileInput
  id="avatar"
  accept="image/png,image/jpeg,image/webp"
  label="Choose image…"
  hint="PNG, JPEG or WebP"
  onSelect={(file) => void handleAvatar(file)}
/>
```

### Card
Card container with hover effects and padding options.

**Props:**
- `hoverable`: boolean (default: false)
- `padding`: 'none' | 'small' | 'medium' | 'large' (default: 'medium')
- `className`: string (optional)

**Example:**
```tsx
<Card hoverable padding="medium">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Modal
Modal dialog with overlay and ESC key support.

**Props:**
- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `title`: string (optional)
- `size`: 'small' | 'medium' | 'large' (default: 'medium')

**Example:**
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure?</p>
</Modal>
```

### Alert
Alert/notification component with multiple types.

**Props:**
- `type`: 'success' | 'danger' | 'warning' | 'info' (default: 'info')
- `title`: string (optional)
- `onClose`: () => void (optional, shows close button when provided)

**Example:**
```tsx
<Alert type="success" title="Success!">
  Your changes have been saved.
</Alert>
```

### Spinner
Loading spinner with size and color options.

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `color`: 'primary' | 'white' (default: 'primary')

**Example:**
```tsx
<Spinner size="medium" color="primary" />
```

### ProgressBar
Progress indicator with variants and label display.

**Props:**
- `value`: number (0-100, required)
- `showLabel`: boolean (default: false)
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `variant`: 'primary' | 'success' | 'warning' | 'danger' (default: 'primary')
- `label`: string (optional accessible name — pass one when a page shows several bars)
- `className`: string

**Example:**
```tsx
<ProgressBar value={75} variant="success" showLabel />
```

### FormField
Form field wrapper with label, validation, and helper text.

**Props:**
- `label`: string (required)
- `htmlFor`: string (required)
- `error`: string (optional error message)
- `required`: boolean (default: false)
- `helper`: string (optional helper text)

**Example:**
```tsx
<FormField
  label="Email"
  htmlFor="email"
  required
  helper="We'll never share your email"
>
  <Input type="email" id="email" />
</FormField>
```

### Checkbox
A native checkbox with its label. Native on purpose: consent has to start
unticked and read unambiguously to assistive tech as checked/unchecked.

**Props:**
- `checked`: boolean (required)
- `onChange`: `(checked: boolean) => void` (required)
- `label`: ReactNode (required — can carry links via `<Trans>`)
- `disabled`: boolean
- `id`: string (optional; generated with `useId` otherwise)

**Example:**
```tsx
<Checkbox checked={agreed} onChange={setAgreed} label={t('account.confirm')} />
```

### Switch
An on/off toggle (`role="switch"`). The label is the accessible name and must
describe what ON means ("Raw JSON"), not what pressing does ("Show raw JSON").

**Props:**
- `checked`: boolean (required)
- `onChange`: `(checked: boolean) => void` (required)
- `label`: string (required)

**Example:**
```tsx
<Switch checked={raw} onChange={setRaw} label="Raw JSON" />
```

### Toast
A transient report, portalled to `document.body` and auto-dismissed (10s by
default). Render it conditionally and clear your state in `onDismiss`.

**Props:**
- `children`: ReactNode (required)
- `variant`: 'success' | 'danger' | 'info' (default: 'success')
- `onDismiss`: `() => void` (required — keep it stable, e.g. `useCallback`)
- `durationMs`: number (default: 10000)

**Example:**
```tsx
{message && <Toast onDismiss={clearMessage}>{message}</Toast>}
```

## Design Tokens

All components use CSS custom properties defined in `src/index.css` (`:root`,
with overrides under `prefers-color-scheme: dark`). Reference tokens rather than
raw colours, and define a token before using it: an undefined `var(--x)` fails
silently and paints nothing. `src/designTokens.test.ts` fails the build on any
token used without a fallback that is never defined, and on a status token
(`--success`, `--warning`, `--danger`, `--track`) missing from either theme.
