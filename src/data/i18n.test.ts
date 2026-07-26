import { describe, expect, test } from 'vitest';
import { t, TRANSLATIONS, TranslationKey, Lang } from './i18n';

describe('i18n translation function', () => {
  test('every key carries a non-empty translation in both locales', () => {
    const incomplete = Object.entries(TRANSLATIONS).filter(
      ([, value]) => !value.es?.trim() || !value.en?.trim(),
    );
    expect(incomplete.map(([key]) => key)).toEqual([]);
  });

  test('translates known keys in both supported languages', () => {
    expect(t('nav.services', 'en')).toBe('Services');
    expect(t('nav.services', 'es')).toBe('Servicios');
  });

  test('fails visibly for an unknown key or language', () => {
    const unknownKey = 'unknown.key.that.does.not.exist' as TranslationKey;
    expect(t(unknownKey, 'en')).toBe(unknownKey);
    expect(t('nav.services', 'fr' as Lang)).toBe('nav.services');
  });
});
