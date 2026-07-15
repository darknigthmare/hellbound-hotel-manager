import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  EyeOff,
  Flame,
  Gauge,
  LockKeyhole,
  MapPin,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HelluvaAtlasGallery } from '../components/HelluvaAtlasGallery';
import { HelluvaRoster } from '../components/HelluvaRoster';
import { db } from '../db/localDb';
import {
  HELLUVA_CHARACTERS,
  HELLUVA_CONTRACTS,
  HELLUVA_CREW_IDS,
  HELLUVA_LORE,
  HELLUVA_SPRITE_SHEETS,
  getHelluvaApproachesForContract,
  HelluvaCharacterProfile,
} from '../expansions/helluva-boss/data';
import {
  describeHelluvaEffects,
  getHelluvaContractStatus,
  getHelluvaOutcome,
  HelluvaContractStatus,
} from '../expansions/helluva-boss/engine';
import {
  HELLUVA_BOSS_SPOILER_SCOPES,
  HELLUVA_BOSS_SPOILER_SCOPE_COPY,
  isHelluvaBossSpoilerVisible,
} from '../expansions/helluva-boss/spoilers';
import { DatabaseState, HelluvaBossSpoilerScope } from '../types';
import '../styles/helluva-boss.css';

interface HelluvaBossProps {
  state: DatabaseState;
  onStateChange: () => void;
  onManageExtensions: () => void;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  percent?: number;
  tone?: 'default' | 'danger' | 'positive';
}

interface FeaturedCastProps {
  characterIds: readonly string[];
  spoilerScope: HelluvaBossSpoilerScope;
  compact?: boolean;
}

type PendingFocusTarget = 'active_contract' | 'next_choice';

const phaseLabels = ['Briefing', 'Field operation', 'Debrief'] as const;
const numberFormatter = new Intl.NumberFormat('en-US');

const helluvaCharacterById = new Map(
  HELLUVA_CHARACTERS.map((character) => [character.id, character] as const),
);

const FeaturedCast: React.FC<FeaturedCastProps> = ({ characterIds, spoilerScope, compact = false }) => {
  const visibleProfiles = characterIds
    .map((characterId) => helluvaCharacterById.get(characterId))
    .filter((profile): profile is HelluvaCharacterProfile => Boolean(
      profile && isHelluvaBossSpoilerVisible(spoilerScope, profile.spoilerScope),
    ));
  const hiddenCount = characterIds.length - visibleProfiles.length;

  return (
    <div className={`helluva-featured-cast${compact ? ' is-compact' : ''}`}>
      <span>Simulation AU featured cast</span>
      <ul aria-label="Featured character profiles">
        {visibleProfiles.map((profile) => <li key={profile.id}>{profile.name}</li>)}
        {hiddenCount > 0 && (
          <li className="is-hidden"><EyeOff size={12} aria-hidden="true" /> {hiddenCount} spoiler-hidden</li>
        )}
      </ul>
    </div>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, detail, percent, tone = 'default' }) => (
  <article className={`helluva-metric glass-panel is-${tone}`}>
    <div className="helluva-metric__icon" aria-hidden="true"><Icon size={19} /></div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
    {typeof percent === 'number' && (
      <div
        className="helluva-meter"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <span style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    )}
  </article>
);

const contractStatusLabel: Record<HelluvaContractStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  active: 'Active',
  completed: 'Completed',
};

const ContractStatusIcon: React.FC<{ status: HelluvaContractStatus }> = ({ status }) => {
  if (status === 'completed') return <CheckCircle2 size={16} aria-hidden="true" />;
  if (status === 'available') return <Play size={15} aria-hidden="true" />;
  if (status === 'active') return <Target size={16} aria-hidden="true" />;
  return <LockKeyhole size={15} aria-hidden="true" />;
};

export const HelluvaBoss: React.FC<HelluvaBossProps> = ({ state, onStateChange, onManageExtensions }) => {
  const campaign = state.extensions.helluvaBoss;
  const [notice, setNotice] = useState<string | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const activeContractRef = useRef<HTMLElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const contractBoardRef = useRef<HTMLElement>(null);
  const pendingFocusRef = useRef<PendingFocusTarget | null>(null);

  useEffect(() => {
    const pendingTarget = pendingFocusRef.current;
    if (!campaign?.enabled || !pendingTarget) return;

    const moveFocus = () => {
      const target = pendingTarget === 'active_contract'
        ? activeContractRef.current
        : firstChoiceRef.current || activeContractRef.current || contractBoardRef.current;
      pendingFocusRef.current = null;
      if (!target) return;
      target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    };

    if (typeof window.requestAnimationFrame === 'function') {
      const frameId = window.requestAnimationFrame(moveFocus);
      return () => window.cancelAnimationFrame(frameId);
    }

    const timeoutId = window.setTimeout(moveFocus, 0);
    return () => window.clearTimeout(timeoutId);
  }, [
    campaign?.activeContractId,
    campaign?.activePhaseIndex,
    campaign?.completedContractIds.length,
    campaign?.enabled,
    campaign?.status,
  ]);

  if (!campaign?.enabled) {
    return (
      <div className="page-container animate-fade-in helluva-page">
        <section className="helluva-disabled glass-panel art-deco-border" aria-labelledby="helluva-disabled-title">
          <LockKeyhole size={38} aria-hidden="true" />
          <span>Optional content pack</span>
          <h1 id="helluva-disabled-title">Helluva Boss · I.M.P.</h1>
          <p>Enable the extension to open its isolated campaign. Any earlier progress remains stored while the pack is disabled.</p>
          <button type="button" className="btn btn-primary" onClick={onManageExtensions}>
            Manage extensions <ChevronRight size={16} aria-hidden="true" />
          </button>
        </section>
      </div>
    );
  }

  const activeContract = campaign.activeContractId
    ? HELLUVA_CONTRACTS.find((contract) => contract.id === campaign.activeContractId)
    : undefined;
  const activePhaseIndex = campaign.activePhaseIndex as 0 | 1 | 2;
  const availableApproaches = activeContract
    ? getHelluvaApproachesForContract(activeContract.id, activePhaseIndex)
    : [];
  const averageFatigue = HELLUVA_CREW_IDS.reduce(
    (total, crewId) => total + (campaign.crewFatigue[crewId] || 0),
    0,
  ) / HELLUVA_CREW_IDS.length;
  const completionPercent = (campaign.completedContractIds.length / HELLUVA_CONTRACTS.length) * 100;
  const outcome = getHelluvaOutcome(campaign);
  const spoilerCopy = HELLUVA_BOSS_SPOILER_SCOPE_COPY[campaign.spoilerScope];
  const visibleCharacters = HELLUVA_CHARACTERS.filter((character) => (
    isHelluvaBossSpoilerVisible(campaign.spoilerScope, character.spoilerScope)
  ));
  const visibleLore = HELLUVA_LORE.filter((entry) => (
    isHelluvaBossSpoilerVisible(campaign.spoilerScope, entry.spoilerScope)
  ));
  const hiddenProfileCount = HELLUVA_CHARACTERS.length - visibleCharacters.length;

  const reportFailure = (fallback: string) => {
    setNotice(db.getStorageStatus().lastError?.message || fallback);
  };

  const changeSpoilers = (spoilerScope: HelluvaBossSpoilerScope) => {
    if (!db.setHelluvaBossSpoilers(spoilerScope)) {
      reportFailure('The Helluva Boss spoiler scope could not be saved.');
      return;
    }
    setNotice(HELLUVA_BOSS_SPOILER_SCOPE_COPY[spoilerScope].changeNotice);
    onStateChange();
  };

  const startContract = (contractId: string, title: string) => {
    if (!db.startHelluvaBossContract(contractId)) {
      reportFailure(`“${title}” could not be started.`);
      return;
    }
    setNotice(`Contract accepted: ${title}. Complete all three phases to close the mission.`);
    pendingFocusRef.current = 'active_contract';
    onStateChange();
  };

  const resolveChoice = (choiceId: string, label: string) => {
    if (!db.resolveHelluvaBossChoice(choiceId)) {
      reportFailure(`The approach “${label}” could not be applied.`);
      return;
    }
    setNotice(`Approach recorded: ${label}.`);
    pendingFocusRef.current = 'next_choice';
    onStateChange();
  };

  const resetCampaign = () => {
    if (!db.resetHelluvaBossCampaign()) {
      reportFailure('The I.M.P. campaign could not be reset.');
      setIsResetOpen(false);
      return;
    }
    setIsResetOpen(false);
    setNotice('The I.M.P. campaign has restarted at Day 1. Hotel data was preserved.');
    onStateChange();
  };

  return (
    <div className="page-container animate-fade-in helluva-page">
      <header className="helluva-hero">
        <div className="helluva-hero__copy">
          <span className="extension-kicker"><BriefcaseBusiness size={16} aria-hidden="true" /> Hellaverse extension</span>
          <h1>Helluva Boss · I.M.P.</h1>
          <p>Lead an isolated twelve-contract management campaign built around I.M.P. Every mission, score and ending is original Simulation AU gameplay.</p>
          <div className="helluva-hero__badges" aria-label="Campaign content labels">
            <span><ShieldCheck size={15} aria-hidden="true" /> Separate from hotel operations</span>
            <span><Sparkles size={15} aria-hidden="true" /> 36 decision phases</span>
            <span><CalendarDays size={15} aria-hidden="true" /> Campaign day {campaign.campaignDay}</span>
          </div>
        </div>
        <div className="helluva-hero__controls glass-panel">
          <label htmlFor="helluva-spoiler-scope">Reference visibility</label>
          <select
            id="helluva-spoiler-scope"
            value={campaign.spoilerScope}
            onChange={(event) => changeSpoilers(event.target.value as HelluvaBossSpoilerScope)}
          >
            {HELLUVA_BOSS_SPOILER_SCOPES.map((scope) => (
              <option key={scope} value={scope}>
                {HELLUVA_BOSS_SPOILER_SCOPE_COPY[scope].selectorLabel}
              </option>
            ))}
          </select>
          <small><EyeOff size={13} aria-hidden="true" /> Contract gameplay remains available; this only filters reference profiles and lore.</small>
          <button type="button" className="btn btn-secondary" onClick={onManageExtensions}>Manage content pack</button>
        </div>
      </header>

      {notice && (
        <div className="extension-notice" role="status" aria-live="polite">
          {notice}
        </div>
      )}

      <section className="helluva-outcome glass-panel" aria-labelledby="helluva-outcome-title">
        <div className="helluva-outcome__icon" aria-hidden="true">
          {campaign.status === 'victory' ? <Trophy size={27} /> : campaign.status === 'collapse' ? <Flame size={27} /> : <Target size={27} />}
        </div>
        <div>
          <span>Simulation AU campaign state</span>
          <h2 id="helluva-outcome-title">{outcome.title}</h2>
          <p>{outcome.summary}</p>
        </div>
        {campaign.status !== 'active' && (
          <button type="button" className="btn btn-primary" onClick={() => setIsResetOpen(true)}>
            <RotateCcw size={16} aria-hidden="true" /> Restart campaign
          </button>
        )}
      </section>

      <section className="helluva-metrics" aria-label="I.M.P. campaign metrics">
        <MetricCard icon={CircleDollarSign} label="I.M.P. funds" value={`${numberFormatter.format(campaign.funds)} cr`} detail="Separate operational balance" tone={campaign.funds < 0 ? 'danger' : 'positive'} />
        <MetricCard icon={Flame} label="Living-world heat" value={`${campaign.heat}%`} detail="100% suspends operations" percent={campaign.heat} tone={campaign.heat >= 75 ? 'danger' : 'default'} />
        <MetricCard icon={UsersRound} label="Crew cohesion" value={`${campaign.cohesion}%`} detail="Trust under mission pressure" percent={campaign.cohesion} tone={campaign.cohesion <= 25 ? 'danger' : 'positive'} />
        <MetricCard icon={EyeOff} label="Discretion" value={`${campaign.discretion}%`} detail="Control of infernal evidence" percent={campaign.discretion} />
        <MetricCard icon={Star} label="Reputation" value={`${campaign.reputation}%`} detail="I.M.P. client confidence" percent={campaign.reputation} />
        <MetricCard icon={Gauge} label="Average fatigue" value={`${Math.round(averageFatigue)}%`} detail="100% forces recovery" percent={averageFatigue} tone={averageFatigue >= 75 ? 'danger' : 'default'} />
      </section>

      {activeContract && campaign.status === 'active' && (
        <section
          id="helluva-active-contract"
          ref={activeContractRef}
          className="helluva-active-contract glass-panel art-deco-border"
          aria-labelledby="active-contract-title"
          tabIndex={-1}
        >
          <div className="helluva-section-header">
            <div>
              <span>Active contract · Phase {activePhaseIndex + 1} of 3</span>
              <h2 id="active-contract-title">{activeContract.title}</h2>
              <p>{activeContract.phaseBriefs[activePhaseIndex]}</p>
            </div>
            <span className={`helluva-difficulty is-${activeContract.difficulty}`}>{activeContract.difficulty}</span>
          </div>

          <ol className="helluva-phases" aria-label="Contract phases">
            {phaseLabels.map((phase, index) => (
              <li
                key={phase}
                className={index === activePhaseIndex ? 'is-current' : index < activePhaseIndex ? 'is-complete' : ''}
                aria-current={index === activePhaseIndex ? 'step' : undefined}
              >
                <span>{index < activePhaseIndex ? <CheckCircle2 size={15} aria-hidden="true" /> : index + 1}</span>
                <strong>{phase}</strong>
              </li>
            ))}
          </ol>

          <FeaturedCast
            characterIds={activeContract.featuredCharacterIds}
            spoilerScope={campaign.spoilerScope}
          />

          <div className="helluva-choice-grid" aria-label={`Approaches for ${phaseLabels[activePhaseIndex]}`}>
            {availableApproaches.map((choice, index) => {
              const effects = describeHelluvaEffects(choice.effects);
              return (
                <button
                  key={choice.id}
                  ref={index === 0 ? firstChoiceRef : undefined}
                  type="button"
                  className="helluva-choice"
                  onClick={() => resolveChoice(choice.id, choice.label)}
                >
                  <strong>{choice.label}</strong>
                  <span>{choice.description}</span>
                  <small aria-label={`Effects: ${effects.join(', ')}`}>
                    {effects.map((effect) => <em key={effect}>{effect}</em>)}
                  </small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {campaign.activeContractId && !activeContract && (
        <div className="extension-notice is-error" role="alert">
          The active contract is missing from this content version. Reset the campaign to restore a valid contract chain.
        </div>
      )}

      <section ref={contractBoardRef} aria-labelledby="contract-board-title" tabIndex={-1}>
        <div className="helluva-section-header">
          <div>
            <span>Three chapters · Twelve contracts</span>
            <h2 id="contract-board-title">I.M.P. contract board</h2>
            <p>Each contract contains briefing, field operation and debrief choices.</p>
          </div>
          <div className="helluva-progress-summary" aria-label={`${campaign.completedContractIds.length} of ${HELLUVA_CONTRACTS.length} contracts completed`}>
            <strong>{campaign.completedContractIds.length}/{HELLUVA_CONTRACTS.length}</strong>
            <div className="helluva-meter" aria-hidden="true"><span style={{ width: `${completionPercent}%` }} /></div>
          </div>
        </div>

        <div className="helluva-contract-grid">
          {HELLUVA_CONTRACTS.map((contract) => {
            const status = getHelluvaContractStatus(campaign, contract);
            const entersDebt = campaign.funds < contract.entryCost;
            return (
              <article
                key={contract.id}
                id={`helluva-contract-${contract.id}`}
                className={`helluva-contract glass-panel is-${status}`}
                aria-labelledby={`${contract.id}-title`}
              >
                <div className="helluva-contract__topline">
                  <span>Chapter {contract.chapter} · Contract {contract.order} · Simulation AU</span>
                  <span className={`helluva-contract__status is-${status}`}><ContractStatusIcon status={status} /> {contractStatusLabel[status]}</span>
                </div>
                <h3 id={`${contract.id}-title`}>{contract.title}</h3>
                <p>{contract.summary}</p>
                <FeaturedCast
                  characterIds={contract.featuredCharacterIds}
                  spoilerScope={campaign.spoilerScope}
                  compact
                />
                <dl>
                  <div><dt><MapPin size={13} aria-hidden="true" /> Location</dt><dd>{contract.location}</dd></div>
                  <div><dt>Client</dt><dd>{contract.client}</dd></div>
                  <div><dt>Entry</dt><dd>{contract.entryCost} cr</dd></div>
                  <div><dt>Reward</dt><dd>{contract.reward} cr</dd></div>
                </dl>
                <div className="helluva-contract__footer">
                  <span className={`helluva-difficulty is-${contract.difficulty}`}>{contract.difficulty}</span>
                  {status === 'available' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => startContract(contract.id, contract.title)}
                      title={entersDebt ? 'Accepting this contract puts I.M.P. in debt and risks insolvency.' : undefined}
                    >
                      <Play size={14} aria-hidden="true" /> {entersDebt ? 'Accept on credit' : 'Accept'}
                    </button>
                  )}
                  {status === 'active' && <span className="helluva-contract__active-label">Choose the current phase above</span>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <HelluvaRoster
        key={campaign.spoilerScope}
        characters={visibleCharacters}
        totalProfileCount={HELLUVA_CHARACTERS.length}
        hiddenProfileCount={hiddenProfileCount}
        hiddenContentLabel={spoilerCopy.hiddenContentLabel}
      />

      <HelluvaAtlasGallery
        sheets={HELLUVA_SPRITE_SHEETS}
        spoilerScope={campaign.spoilerScope}
        hiddenContentLabel={spoilerCopy.hiddenContentLabel}
      />

      <section aria-labelledby="helluva-lore-title">
        <div className="helluva-section-header">
          <div>
            <span>Canon and gameplay boundary</span>
            <h2 id="helluva-lore-title">Helluva lore files</h2>
            <p>Reference facts are kept separate from original campaign systems.</p>
          </div>
          <BookOpen size={27} aria-hidden="true" />
        </div>
        <div className="helluva-lore-grid">
          {visibleLore.map((entry) => (
            <article key={entry.id} id={`helluva-lore-${entry.id}`} className="helluva-lore-card glass-panel">
              <div><span>{entry.category.replace('_', ' ')}</span><span>{entry.spoilerScope.replace('_', ' ')}</span></div>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
              <small>{entry.sourceRef}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="helluva-log glass-panel" aria-labelledby="helluva-log-title">
        <div className="helluva-section-header">
          <div>
            <span>Isolated save history</span>
            <h2 id="helluva-log-title">I.M.P. operation log</h2>
          </div>
          <button type="button" className="btn btn-danger" onClick={() => setIsResetOpen(true)}>
            <RotateCcw size={15} aria-hidden="true" /> Reset campaign
          </button>
        </div>
        {campaign.operationLog.length > 0 ? (
          <ol>
            {campaign.operationLog.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
          </ol>
        ) : (
          <p>No operations have been recorded.</p>
        )}
      </section>

      <ConfirmDialog
        isOpen={isResetOpen}
        title="Reset the I.M.P. campaign?"
        message="This deletes all Helluva Boss contracts, choices, metrics and operation logs, then restarts at Day 1. Hazbin Hotel records and the extension setting are preserved."
        onConfirm={resetCampaign}
        onCancel={() => setIsResetOpen(false)}
      />
    </div>
  );
};
