import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

if (!insforgeUrl || !insforgeAnonKey) {
  throw new Error(
    'Missing InsForge environment variables. Check .env.local for NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.'
  );
}

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});

export default insforge;
