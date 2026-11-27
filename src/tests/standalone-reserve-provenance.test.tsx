// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ReserveGallery } from '../standalone/ReserveGallery';

afterEach(cleanup);

function GalleryWithScope() {
  const [allowSeasonTwo, setSeasonTwo] = useState(true);
  const [allowSeasonThree, setSeasonThree] = useState(false);
  return <ReserveGallery titleRef={null} allowSeasonTwo={allowSeasonTwo} allowSeasonThree={allowSeasonThree} onScopeChange={setSeasonTwo} onSeasonThreeChange={setSeasonThree} />;
}

describe('reserve artwork provenance', () => {
  it.each([
    { name: 'Gerald', id: 'hb_gerald-barbie-bad-day-portrait', time: '20s' },
    { name: 'Rick', id: 'hb_rick-barbie-bad-day-portrait', time: '160s' },
  ])('identifies $name as a Barbie’s Bad Day portrait and keeps the strict filter effective', ({ name, id, time }) => {
    render(<GalleryWithScope />);
    const title = `${name} · Barbie’s Bad Day · portrait`;
    fireEvent.click(screen.getByRole('button', { name: new RegExp(title) }));
    const detail = within(screen.getByRole('article', { name: `Détail de ${title}` }));
    expect(detail.getByText(/COURT OFFICIEL · 2026/)).toBeTruthy();
    expect(detail.getByText(/Portrait du court officiel Barbie’s Bad Day \(2026\)/)).toBeTruthy();
    expect(detail.getByText(/Archive narrative statique · Buste/)).toBeTruthy();
    expect(detail.queryByText(/IMP Training Video|porte-clés/)).toBeNull();
    expect(detail.getByRole('img', { name: title }).getAttribute('src')).toBe(`/assets/production/v16/characters/${id}.webp`);
    fireEvent.click(detail.getByText('Références et détails du dessin'));
    expect(detail.getByRole('link', { name: new RegExp(`${parseInt(time)} s$`) }).getAttribute('href')).toBe(`https://www.youtube.com/watch?v=PyICIy6fkDo&t=${time}`);
    fireEvent.change(screen.getByLabelText('Contenu de la galerie'), { target: { value: 'season_1' } });
    expect(screen.queryByRole('article', { name: `Détail de ${title}` })).toBeNull();
    expect(screen.queryByRole('button', { name: /(?:Gerald|Rick) · Barbie’s Bad Day · portrait/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Contenu de la galerie'), { target: { value: 'all' } });
    expect(screen.getByRole('button', { name: new RegExp(title) })).toBeTruthy();
  });

  it.each([
    { name: /Millie · robe et ombrelle, IMP Training Video/, note: /Costume du court officiel IMP Training Video.*porte-clés officiel/, product: /Millie side/, url: 'https://sharkrobot.com/products/moxxie-millie-dress-disguise-keychain' },
    { name: /Moxxie · robe et ombrelle, IMP Training Video/, note: /Costume du court officiel IMP Training Video.*porte-clés officiel/, product: /Moxxie side/, url: 'https://sharkrobot.com/products/moxxie-millie-dress-disguise-keychain' },
    { name: /Blitzø · tenue du flashback, Ghostf/, note: /Costume du flashback de Ghostf.*standee officiel/, product: /Flashback Blitz Standee/, url: 'https://sharkrobot.com/products/flashback-blitz-standee' },
  ])('preserves the V14 costume’s own work and product provenance ($product)', ({ name, note, product, url }) => {
    render(<GalleryWithScope />);
    fireEvent.click(screen.getByRole('button', { name }));
    const detail = within(screen.getByRole('article'));
    expect(detail.getByText(note)).toBeTruthy();
    expect(detail.getByText(/Tenue statique disponible dans le vestiaire/)).toBeTruthy();
    expect(detail.queryByText(/Portrait du court officiel Barbie’s Bad Day/)).toBeNull();
    fireEvent.click(detail.getByText('Références et détails du dessin'));
    expect(detail.getByRole('link', { name: product }).getAttribute('href')).toBe(url);
  });

  it('qualifies historical and secondary Roo evidence without presenting it as an episode model', () => {
    render(<GalleryWithScope />);
    fireEvent.click(screen.getByRole('button', { name: /Roo · concept 2019 · portrait/ }));
    const detail = within(screen.getByRole('article', { name: 'Détail de Roo · concept 2019 · portrait' }));
    expect(detail.getByText(/MODÈLE HISTORIQUE · 2019/)).toBeTruthy();
    expect(detail.getByText(/Archive narrative statique · Buste/)).toBeTruthy();
    fireEvent.click(detail.getByText('Références et détails du dessin'));
    expect(detail.getByRole('link', { name: /^Reproduction secondaire —/ }).getAttribute('href')).toContain('comicbook.com');
    expect(detail.getByRole('link', { name: /^Source primaire attribuée, accès non obtenu —/ }).getAttribute('href')).toContain('1185376557419782144');
    expect(detail.queryByRole('link', { name: 'Référence officielle' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Contenu de la galerie'), { target: { value: 'season_1' } });
    expect(screen.queryByRole('heading', { name: 'Roo · concept 2019 · portrait' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Queef · Creator Collection/ })).toBeNull();
  });

  it('keeps pilot and storybook archives visible in season one with explicit context and complete image framing', () => {
    render(<GalleryWithScope />);
    fireEvent.change(screen.getByLabelText('Contenu de la galerie'), { target: { value: 'season_1' } });
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'narrative_archive' } });
    fireEvent.click(screen.getByRole('button', { name: /Top Hat Demon · pilote 2019 · portrait/ }));
    expect(within(screen.getByRole('article')).getByText(/PILOTE · 2019/)).toBeTruthy();
    expect(within(screen.getByRole('article')).getByText(/Portrait du pilote de 2019/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Refermer l’aperçu' }));
    for (const name of ['Eve · silhouette assise du récit S1', 'Lilith · silhouette debout du récit S1']) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));
      const detail = within(screen.getByRole('article'));
      expect(detail.getByText(/RÉCIT · SAISON 1/)).toBeTruthy();
      expect(detail.getByText(/Archive narrative statique · Silhouette entière/)).toBeTruthy();
      expect(detail.getByText(/elle ne constitue pas un modèle détaillé de combat/)).toBeTruthy();
      expect(detail.getByRole('img', { name }).classList.contains('is-storybook')).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: 'Refermer l’aperçu' }));
    }
  });
});
