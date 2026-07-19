import React, { useState } from 'react';
import { Boxes, Info, LockKeyhole, Sparkles } from 'lucide-react';
import { ContentPackCard } from '../components/ContentPackCard';
import { db } from '../db/localDb';
import { HELLUVA_CHARACTERS, HELLUVA_CONTRACTS, HELLUVA_LORE } from '../expansions/helluva-boss/data';
import { DatabaseState } from '../types';
import '../styles/helluva-boss.css';

interface ExtensionsProps {
  state: DatabaseState;
  onStateChange: () => void;
  onOpenHelluva: () => void;
}

const HELLUVA_PACK_STATS = [
  { label: 'Profiles', value: String(HELLUVA_CHARACTERS.length) },
  { label: 'Combat poses / profile', value: '48' },
  { label: 'Contracts', value: String(HELLUVA_CONTRACTS.length) },
  { label: 'Decision phases', value: String(HELLUVA_CONTRACTS.length * 3) },
  { label: 'Lore records', value: String(HELLUVA_LORE.length) },
] as const;

export const Extensions: React.FC<ExtensionsProps> = ({ state, onStateChange, onOpenHelluva }) => {
  const helluvaState = state.extensions.helluvaBoss;
  const enabled = Boolean(helluvaState?.enabled);
  const [notice, setNotice] = useState<string | null>(null);
  const completedContracts = helluvaState?.completedContractIds.length ?? 0;

  const toggleHelluvaBoss = (nextEnabled: boolean) => {
    if (!db.toggleHelluvaBossExtension(nextEnabled)) {
      setNotice(db.getStorageStatus().lastError?.message || 'The extension setting could not be saved.');
      return;
    }

    setNotice(nextEnabled
      ? 'Helluva Boss is enabled. Its I.M.P. campaign is now available in the extension area.'
      : 'Helluva Boss is disabled. Its campaign progress remains safely stored.');
    onStateChange();
  };

  return (
    <div className="page-container animate-fade-in extensions-page">
      <header className="extension-page-header">
        <div>
          <span className="extension-kicker"><Boxes size={16} aria-hidden="true" /> Content library</span>
          <h1>Manage Extensions</h1>
          <p>Activate optional campaigns without mixing their cast, rules or progression into hotel operations.</p>
        </div>
      </header>

      <div className="extension-principles glass-panel" role="note">
        <Info size={20} aria-hidden="true" />
        <div>
          <strong>Shared universe does not mean shared storyline.</strong>
          <p>Helluva Boss inhabits the Hellaverse, while I.M.P. and the Hazbin Hotel remain separate casts and operational systems here.</p>
        </div>
      </div>

      {notice && (
        <div className="extension-notice" role="status" aria-live="polite">
          {notice}
        </div>
      )}

      <section aria-labelledby="available-content-heading">
        <div className="extension-section-heading">
          <div>
            <span>Installed locally</span>
            <h2 id="available-content-heading">Available content packs</h2>
          </div>
          <span className="extension-pack-count">1 pack</span>
        </div>

        <ContentPackCard
          packId="helluva-boss"
          title="Helluva Boss · I.M.P."
          subtitle="A long-form contract campaign in the same universe"
          description="Manage Immediate Murder Professionals through twelve original Simulation AU contracts, three decisions per mission and multiple non-canon operational endings."
          enabled={enabled}
          stats={HELLUVA_PACK_STATS}
          progressLabel={helluvaState
            ? `Saved progress: ${completedContracts}/${HELLUVA_CONTRACTS.length} contracts · Campaign day ${helluvaState.campaignDay}. Progress is kept when disabled.`
            : 'No campaign save yet. Enabling the pack creates an isolated I.M.P. save.'}
          onToggle={toggleHelluvaBoss}
          onOpen={onOpenHelluva}
        />
      </section>

      <section className="extension-safety-grid" aria-labelledby="extension-rules-heading">
        <h2 id="extension-rules-heading" className="sr-only">Extension rules</h2>
        <article className="glass-panel">
          <LockKeyhole size={22} aria-hidden="true" />
          <h3>Preserved progress</h3>
          <p>Disabling the pack hides its navigation entry; it does not erase contracts, choices, metrics or logs.</p>
        </article>
        <article className="glass-panel">
          <Sparkles size={22} aria-hidden="true" />
          <h3>Canon clearly labelled</h3>
          <p>Profiles and lore cite the series. Contracts, scores and endings are always identified as Simulation AU gameplay.</p>
        </article>
      </section>
    </div>
  );
};
