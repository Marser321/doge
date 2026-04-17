import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import path from 'path';

describe('insforge', () => {
  const originalUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const originalKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  beforeEach(() => {
    // Clear modules cache to force re-evaluation of process.env check
    const modulePath = path.resolve('./src/lib/insforge.ts');
    delete require.cache[modulePath];
  });

  afterEach(() => {
    // Restore environment variables
    if (originalUrl !== undefined) {
      process.env.NEXT_PUBLIC_INSFORGE_URL = originalUrl;
    } else {
      delete process.env.NEXT_PUBLIC_INSFORGE_URL;
    }

    if (originalKey !== undefined) {
      process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY = originalKey;
    } else {
      delete process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
    }
  });

  it('throws error when NEXT_PUBLIC_INSFORGE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_INSFORGE_URL;
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY = 'test-anon-key';

    expect(() => {
      require('./insforge');
    }).toThrow('Missing InsForge environment variables. Check .env.local for NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.');
  });

  it('throws error when NEXT_PUBLIC_INSFORGE_ANON_KEY is missing', () => {
    process.env.NEXT_PUBLIC_INSFORGE_URL = 'http://test-url.com';
    delete process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

    expect(() => {
      require('./insforge');
    }).toThrow('Missing InsForge environment variables. Check .env.local for NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.');
  });

  it('throws error when both variables are missing', () => {
    delete process.env.NEXT_PUBLIC_INSFORGE_URL;
    delete process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

    expect(() => {
      require('./insforge');
    }).toThrow('Missing InsForge environment variables. Check .env.local for NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.');
  });

  it('does not throw and exports client when both variables are present', () => {
    process.env.NEXT_PUBLIC_INSFORGE_URL = 'http://test-url.com';
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY = 'test-anon-key';

    expect(() => {
      require('./insforge');
    }).not.toThrow();

    const insforgeModule = require('./insforge');
    expect(insforgeModule.insforge).toBeDefined();
    expect(insforgeModule.default).toBeDefined();
  });
});
