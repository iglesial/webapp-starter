import type { ChangeEvent } from 'react';
import './FileInput.css';

// A native file input cannot be styled, so the input itself is visually
// hidden and a <label> acts as the button — clicking the label activates the
// input, and focus is forwarded to the label's ring via :focus-visible.
//
// A separate primitive because Input.tsx restricts its `type` prop to a union
// that excludes 'file', and every upload surface (imports, image uploads)
// needs the same styled control.
interface FileInputProps {
  id: string;
  accept: string;
  label: string;
  // Shown beside the button: the chosen filename, or a hint before choosing.
  hint?: string;
  disabled?: boolean;
  onSelect: (file: File | null) => void;
}

export function FileInput({ id, accept, label, hint, disabled, onSelect }: FileInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onSelect(event.target.files?.[0] ?? null);
  }

  return (
    <div className="file-input">
      <input
        id={id}
        className="file-input-native"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={id} className="file-input-label">
        {label}
      </label>
      {hint && <span className="file-input-hint">{hint}</span>}
    </div>
  );
}
