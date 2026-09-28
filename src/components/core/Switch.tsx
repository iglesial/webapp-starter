import './Switch.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  // Visible text beside the switch. It is also the accessible name, so the
  // control needs no aria-label — and it must describe what being ON means,
  // not what pressing it does ("Raw JSON", never "Show raw JSON").
  label: string;
  className?: string;
}

// role="switch" with aria-checked rather than a button with aria-pressed:
// both are valid, but a switch is the one screen readers announce as "on" and
// "off", which is what this is. A native checkbox would also work and would
// then need its appearance stripped and rebuilt — this is less to fight.
export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={['switch', className].filter(Boolean).join(' ')}
    >
      <span className="switch-track" aria-hidden="true">
        <span className="switch-knob" />
      </span>
      {label}
    </button>
  );
}
