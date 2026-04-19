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

## Design Tokens

All components use CSS variables defined in `src/index.css`:

**Colors:**
- `--primary`: #f97316 (orange)
- `--primary-hover`: #ea580c
- `--success`: #22c55e
- `--danger`: #ef4444
- `--warning`: #eab308
- `--info`: #3b82f6

**Spacing:**
- `--radius`: 12px
- `--radius-sm`: 6px
- `--radius-lg`: 16px

**Shadows:**
- `--shadow-sm`: Subtle shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow

## Preview

View all components in development mode at `/preview`.
