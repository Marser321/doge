import { describe, expect, test } from 'vitest';
import { t, TranslationKey, Lang } from './i18n';

describe('i18n translation function', () => {
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
