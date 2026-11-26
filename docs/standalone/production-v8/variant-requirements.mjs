import assert from 'node:assert/strict';

// One planning requirement per delivered costume/incarnation. This helper is
// shared by the plan synchronizer and workbook; it never changes delivery counts.
export function newVariantRequirements(register) {
  const specified = new Map((register.newVariantRequirements ?? []).map(item => [item.assetId, item]));
  assert.equal(specified.size, (register.newVariantRequirements ?? []).length, 'Duplicate new variant asset mapping.');
  const mapped = new Set((register.variantStates ?? []).map(item => item.assetId).filter(Boolean));
  const costumes = register.assets.filter(asset => asset.category === 'costume');
  for (const id of specified.keys()) {
    assert(costumes.some(asset => asset.id === id), `New variant must name a delivered costume: ${id}`);
    assert(!mapped.has(id), `Variant already mapped to an existing requirement: ${id}`);
  }
  const rows = costumes.filter(asset => !mapped.has(asset.id)).map(asset => {
    assert(asset.accepted, `Unaccepted costume: ${asset.id}`);
    const spec = specified.get(asset.id) ?? {};
    const eligibility = spec.eligibility ?? asset.eligibility ?? spec.gameplayEligibility ?? asset.gameplayEligibility
      ?? (typeof (spec.runtimeSelectable ?? asset.runtimeSelectable) === 'boolean' ? ((spec.runtimeSelectable ?? asset.runtimeSelectable) ? 'wearable' : 'galleryOnly') : undefined);
    assert(['wearable', 'galleryOnly'].includes(eligibility), `Explicit costume eligibility required: ${asset.id}`);
    const row = {
      id: spec.id ?? `VAR-V8-${asset.id}`, assetId: asset.id,
      sourceIdentityId: spec.sourceIdentityId ?? asset.sourceIdentityId,
      name: spec.name ?? asset.name, franchise: spec.franchise ?? asset.franchise,
      continuity: spec.continuity ?? asset.continuity,
      type: spec.type ?? (eligibility === 'galleryOnly' ? 'Incarnation documentée' : 'Costume'),
      status: 'Partiel', eligibility, runtimeSelectable: eligibility === 'wearable',
      referenceUrls: spec.referenceUrls ?? asset.referenceUrls,
      notes: spec.notes ?? `Un dessin statique de cette tenue/incarnation, ${eligibility === 'wearable' ? 'sélectionnable comme costume avec les autres poses non livrées par V8' : 'présenté en galerie, hors sélection de costume de combat'}. Aucun cycle animé ni nouvelle identité.`,
      requirements: spec.requirements ?? 'Tenue ou incarnation précisément référencée ; couverture statique distincte des poses, transitions, animations et mécaniques.',
    };
    assert(row.id.startsWith('VAR-V8-'), 'A new V8 requirement must have its own VAR-V8- ID.');
    for (const key of ['sourceIdentityId', 'name', 'franchise', 'continuity']) assert(typeof row[key] === 'string' && row[key].length, `Missing ${key}: ${asset.id}`);
    assert(Array.isArray(row.referenceUrls) && row.referenceUrls.length, `Missing references: ${asset.id}`);
    return row;
  });
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length, 'Duplicate new variant requirement ID.');
  return rows;
}
