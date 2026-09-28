import { useEffect, type ReactNode } from 'react';
import './PresentationShell.css';

export interface PresentationShellProps {
  children: ReactNode;
}

export function PresentationShell({ children }: PresentationShellProps) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return <div className="presentation-shell">{children}</div>;
}
