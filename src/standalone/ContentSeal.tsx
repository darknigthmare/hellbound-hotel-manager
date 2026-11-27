import { LockKeyhole } from 'lucide-react';
import { contentAccessPresentation, type ContentAccess } from './content-access';

/** A decorative archive seal; this is not a canonical magical object. */
export function ContentSeal({ access, compact = false }: { access: ContentAccess; compact?: boolean }) {
  const presentation = contentAccessPresentation(access, '');
  return <span className={`iv-content-seal ${compact ? 'iv-content-seal--compact' : ''}`}>
    <span className="iv-seal-mark" aria-hidden="true"><LockKeyhole size={16} /></span>
    <strong>{access.label}</strong>
    {!compact && <small>{presentation.requirement}</small>}
  </span>;
}
