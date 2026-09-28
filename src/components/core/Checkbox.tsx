import { useId, type ReactNode } from 'react';
import './Checkbox.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  // ReactNode rather than string: consent copy carries links (to your terms, say)
  // and <Trans> returns elements.
  label: ReactNode;
  disabled?: boolean;
  // Supply one when the caller needs to reference it; otherwise useId keeps
  // the label association correct with two instances on the same page.
  id?: string;
  className?: string;
}

// A NATIVE checkbox, unlike Switch which rebuilds the control on a button.
// Two reasons, both about what this is used for: consent has to start
// unticked and be unambiguous to assistive tech, and a switch reads as
// "on/off" where a consent box reads as "checked/unchecked". Styling a native
// box with accent-color is far less to get wrong than rebuilding one.
export function Checkbox({ checked, onChange, label, disabled, id, className }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={['checkbox', className].filter(Boolean).join(' ')}>
      <input
        id={inputId}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={inputId} className="checkbox-label">
        {label}
      </label>
    </div>
  );
}
