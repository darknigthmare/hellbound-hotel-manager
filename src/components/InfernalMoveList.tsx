import { INFERNAL_SIGNATURES, getCombatMoveInfo, type CombatantDefinition } from '../lib/pentagram-combat';

interface Props {
  one: CombatantDefinition;
  two: CombatantDefinition;
}

const commands = [
  { attack: 'light', label: 'Léger', p1: 'F', p2: 'J' },
  { attack: 'heavy', label: 'Lourd', p1: 'G', p2: 'K' },
  { attack: 'special', label: 'Spécial', p1: 'H', p2: 'L' },
  { attack: 'signature', label: 'Technique', p1: 'T', p2: 'I' },
] as const;

export function InfernalMoveList({ one, two }: Props) {
  return <details className="infernal-movelist">
    <summary>Carnet de coups et enchaînements</summary>
    <p>Le contact est évalué une fois à la fin du démarrage. La portée se mesure en pourcentage de la largeur de l’arène.</p>
    {[one, two].map((fighter, i) => <div className="infernal-movelist-scroll" key={i}>
      <table>
        <caption>{i === 0 ? 'J1' : 'J2'} · {fighter.name}</caption>
        <thead><tr>{['Commande', 'Coup', 'Démarrage', 'Récupération de pose', 'Délai entre attaques', 'Portée', 'Coût'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{commands.map(({ attack, label, p1, p2 }) => {
          if (attack === 'signature' && !fighter.signature) return null;
          const info = getCombatMoveInfo(fighter, attack);
          return <tr key={attack}><th scope="row"><kbd>{i === 0 ? p1 : p2}</kbd> {label}</th><td>{info.name}</td><td>{info.startupMs} ms</td><td>{info.recoveryMs} ms</td><td>{info.cooldownMs} ms</td><td>{info.reach.toFixed(1)} %</td><td>{info.tensionCost}</td></tr>;
        })}</tbody>
      </table>
      {fighter.signature && <p><strong>{INFERNAL_SIGNATURES[fighter.signature].name}.</strong> {INFERNAL_SIGNATURES[fighter.signature].description}</p>}
    </div>)}
    <p><strong>Feinte.</strong> Lancez le léger, puis le lourd avant le contact pour remplacer le premier coup.</p>
    <p><strong>Confirmation.</strong> Après un lourd qui touche sans garde, déclenchez le spécial après l’arrêt sur impact, avant la fin de la pose. Coût de 50 points de tension.</p>
    <p><strong>Fatalité.</strong> Sur le K.-O. décisif, le vainqueur peut jouer sa finition avec sa touche de spécial ou le bouton à l’écran.</p>
  </details>;
}
