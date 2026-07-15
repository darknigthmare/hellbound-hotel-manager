import React from 'react';
import { CheckCircle2, ExternalLink, PackageOpen, Power, ShieldCheck } from 'lucide-react';

export interface ContentPackStat {
  label: string;
  value: string;
}

interface ContentPackCardProps {
  packId: string;
  title: string;
  subtitle: string;
  description: string;
  enabled: boolean;
  stats: readonly ContentPackStat[];
  progressLabel?: string;
  onToggle: (enabled: boolean) => void;
  onOpen: () => void;
}

export const ContentPackCard: React.FC<ContentPackCardProps> = ({
  packId,
  title,
  subtitle,
  description,
  enabled,
  stats,
  progressLabel,
  onToggle,
  onOpen,
}) => {
  const titleId = `${packId}-content-pack-title`;
  const statusId = `${packId}-content-pack-status`;
  const toggleId = `${packId}-content-pack-toggle`;

  return (
    <article className={`content-pack-card glass-panel ${enabled ? 'is-enabled' : ''}`} aria-labelledby={titleId}>
      <div className="content-pack-card__accent" aria-hidden="true" />
      <div className="content-pack-card__header">
        <div className="content-pack-card__icon" aria-hidden="true">
          <PackageOpen size={28} />
        </div>
        <div className="content-pack-card__identity">
          <span className="content-pack-card__eyebrow">Optional content extension</span>
          <h2 id={titleId}>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className={`content-pack-status ${enabled ? 'is-enabled' : ''}`} id={statusId}>
          {enabled ? <CheckCircle2 size={15} aria-hidden="true" /> : <Power size={15} aria-hidden="true" />}
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      <p className="content-pack-card__description">{description}</p>

      <dl className="content-pack-stats" aria-label={`${title} content summary`}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="content-pack-boundary">
        <ShieldCheck size={18} aria-hidden="true" />
        <p>
          <strong>Isolated save data.</strong> Hotel residents, rooms, budget, rehabilitation and canon records are never modified by this campaign.
        </p>
      </div>

      {progressLabel && <p className="content-pack-progress">{progressLabel}</p>}

      <div className="content-pack-card__actions">
        <label className="content-pack-toggle" htmlFor={toggleId}>
          <input
            id={toggleId}
            type="checkbox"
            role="switch"
            checked={enabled}
            aria-describedby={statusId}
            onChange={(event) => onToggle(event.target.checked)}
          />
          <span aria-hidden="true" />
          <strong>{enabled ? 'Extension active' : 'Enable extension'}</strong>
        </label>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpen}
          disabled={!enabled}
          aria-disabled={!enabled}
          title={!enabled ? 'Enable the extension before opening the campaign.' : undefined}
        >
          Open I.M.P. campaign
          <ExternalLink size={16} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};
