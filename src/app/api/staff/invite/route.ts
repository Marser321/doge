import { z } from 'zod';

import { requireStaff } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin, runIdempotentJson } from '@/lib/server/http';
import { getServiceSupabase } from '@/lib/server/supabase';

const schema = z.object({
  email: z.string().email().max(254),
  display_name: z.string().trim().min(2).max(120),
  role: z.enum(['owner', 'manager', 'dispatcher', 'crew']),
});

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'staff-invite', 10, 60 * 60_000);
    if (limited) return limited;
    const owner = await requireStaff(['owner'], { requireMfa: true });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Invitación inválida.');
    return await runIdempotentJson(
      request,
      'staff:invite',
      owner.id,
      JSON.stringify(parsed.data),
      async () => {
        const supabase = getServiceSupabase();
        const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/auth/callback?next=/login/setup`;
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(parsed.data.email.toLowerCase(), {
          redirectTo,
          data: { display_name: parsed.data.display_name },
        });
        if (error || !data.user) throw new Error(error?.message || 'No fue posible crear la invitación.');
        const { error: profileError } = await supabase.from('profiles').update({
          display_name: parsed.data.display_name,
          role: parsed.data.role,
          is_active: true,
        }).eq('id', data.user.id);
        const { error: auditError } = profileError ? { error: null } : await supabase.from('audit_events').insert({
          actor_id: owner.id,
          actor_email: owner.email,
          action: 'profile.invited',
          entity_type: 'profiles',
          entity_id: data.user.id,
          metadata: { role: parsed.data.role },
        });
        if (profileError || auditError) {
          await supabase.auth.admin.deleteUser(data.user.id);
          throw new Error(profileError?.message || auditError?.message || 'No fue posible completar la invitación.');
        }
        return { id: data.user.id, email: data.user.email };
      },
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
