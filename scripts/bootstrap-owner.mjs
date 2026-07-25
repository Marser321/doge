import { createClient } from '@supabase/supabase-js';

const [email, displayName] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!email || !displayName) {
  throw new Error('Usage: node scripts/bootstrap-owner.mjs owner@example.com "Owner DOGE"');
}
if (!url || !secretKey || !appUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY and NEXT_PUBLIC_APP_URL are required.');
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await supabase.auth.admin.inviteUserByEmail(email.toLowerCase(), {
  redirectTo: `${appUrl}/auth/callback?next=/login/setup`,
  data: { display_name: displayName },
});
if (error || !data.user) throw new Error(error?.message || 'Owner invitation failed.');
const profile = await supabase.from('profiles').update({
  display_name: displayName,
  role: 'owner',
  is_active: true,
}).eq('id', data.user.id);
if (profile.error) {
  await supabase.auth.admin.deleteUser(data.user.id);
  throw new Error(profile.error.message);
}
console.log(`Owner invitation sent to ${email}. MFA enrollment is required at first login.`);
