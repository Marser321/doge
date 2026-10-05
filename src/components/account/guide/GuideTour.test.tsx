import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { t as translate, type TranslationKey } from '@/data/i18n';
import { GuideChecklist } from './GuideChecklist';
import { GuideTour, type TourStop } from './GuideTour';

const t = (key: TranslationKey) => translate(key, 'es');

afterEach(cleanup);

describe('GuideChecklist', () => {
  test('expands only the next step and runs its action', () => {
    const run = vi.fn();
    render(
      <GuideChecklist
        steps={[
          { id: 'property', done: true },
          { id: 'space', done: false },
          { id: 'cleanliness', done: false },
          { id: 'schedule', done: false },
          { id: 'membership', done: false },
        ]}
        next="space"
        completion={20}
        t={t}
        actionFor={() => ({ kind: 'callback', label: 'guide.doIt', run })}
        onHide={() => undefined}
      />,
    );
    expect(screen.getByText('20%')).toBeTruthy();
    expect(screen.getByText(t('guide.stepSpaceBody'))).toBeTruthy();
    expect(screen.queryByText(t('guide.stepMembershipBody'))).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(t('guide.doIt')) }));
    expect(run).toHaveBeenCalledOnce();
  });

  test('celebrates when every step is done', () => {
    render(
      <GuideChecklist steps={[]} next={null} completion={100} t={t} actionFor={() => ({ kind: 'link', label: 'guide.doIt', href: '/' })} onHide={() => undefined} />,
    );
    expect(screen.getAllByText(t('guide.allDone')).length).toBeGreaterThan(0);
  });
});

describe('GuideTour', () => {
  const stops: TourStop[] = [
    { target: 'one', title: 'tour.summaryTitle', body: 'tour.summaryBody', tab: 'home' },
    { target: 'two', title: 'tour.helpTitle', body: 'tour.helpBody' },
  ];

  test('walks the stops, switches tabs and finishes', async () => {
    const onStop = vi.fn();
    const onClose = vi.fn();
    document.body.innerHTML = '<div data-guide="one"></div><div data-guide="two"></div>';
    render(<GuideTour stops={stops} t={t} onStop={onStop} onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(t('tour.summaryTitle'))).toBeTruthy();
    expect(onStop).toHaveBeenCalledWith(stops[0]);

    await act(async () => { fireEvent.keyDown(window, { key: 'ArrowRight' }); });
    expect(await screen.findByText(t('tour.helpTitle'))).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: t('guide.finish') }));
    expect(onClose).toHaveBeenCalledWith(true);
  });

  test('Escape closes without finishing', () => {
    const onClose = vi.fn();
    render(<GuideTour stops={stops} t={t} onStop={() => undefined} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledWith(false);
  });
});
