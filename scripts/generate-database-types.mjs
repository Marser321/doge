import { spawnSync } from 'node:child_process';
import { renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve('src/lib/database.types.ts');
const temporary = `${output}.tmp`;
const generated = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['supabase', 'gen', 'types', 'typescript', '--local'],
  { encoding: 'utf8' },
);

if (generated.status !== 0) {
  process.stderr.write(generated.stderr || 'Supabase type generation failed.\n');
  process.exit(generated.status || 1);
}
if (!generated.stdout.includes('export type Database')) {
  throw new Error('Supabase returned an invalid TypeScript schema.');
}

writeFileSync(temporary, generated.stdout, { encoding: 'utf8', mode: 0o600 });
renameSync(temporary, output);
console.log(`Generated ${output}`);
