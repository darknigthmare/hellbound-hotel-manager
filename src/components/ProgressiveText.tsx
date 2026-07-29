import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import '../styles/progressive-text.css';

interface ProgressiveTextProps {
  children: string;
  lines?: number;
  className?: string;
}

type ProgressiveTextStyle = React.CSSProperties & {
  '--progressive-lines': number;
};

export function ProgressiveText({
  children,
  lines = 2,
  className = '',
}: ProgressiveTextProps) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = children.trim().length > 140;

  return (
    <div className={`progressive-text ${className}`.trim()}>
      <p
        className={!expanded && canCollapse ? 'is-collapsed' : undefined}
        style={{ '--progressive-lines': lines } as ProgressiveTextStyle}
      >
        {children}
      </p>
      {canCollapse && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDown
            size={13}
            aria-hidden="true"
            className={expanded ? 'is-expanded' : undefined}
          />
        </button>
      )}
    </div>
  );
}
