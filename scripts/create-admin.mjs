import { createClient } from '@supabase/supabase-js';

const [email, password, displayName = 'CEO DOGE'] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!email || !password) {
  console.log('Uso: node --env-file=.env.local scripts/create-admin.mjs <email> <password> [nombre]');
  process.exit(1);
}

if (!url || !secretKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY son requeridos en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  console.log(`Creando usuario admin para: ${email}...`);
  
  // 1. Crear o actualizar usuario en Supabase Auth
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    password: password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  let userId = userData?.user?.id;

  if (createError) {
    if (createError.message.includes('already exists') || createError.status === 422) {
      console.log('El usuario ya existe en Auth. Obteniendo ID y actualizando contraseña...');
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!existing) throw new Error('No se pudo encontrar el usuario existente.');
      userId = existing.id;
      await supabase.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
      });
    } else {
      throw createError;
    }
  }

  // 2. Asegurar perfil con rol owner y activo
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email: email.toLowerCase(),
    display_name: displayName,
    role: 'owner',
    locale: 'es',
    is_active: true,
  });

  if (profileError) {
    throw new Error(`Error actualizando perfil: ${profileError.message}`);
  }

  console.log('✅ Usuario CEO/Owner configurado con éxito.');
  console.log(`Email: ${email}`);
  console.log('Rol: owner');
  console.log('Estado: activo');
  console.log('\nPuedes iniciar sesión en /login');
  console.log('(Nota: El sistema solicitará configurar verificación en 2 pasos / MFA con Google Authenticator o similar)');
}

run().catch((err) => {
  console.error('❌ Error creando admin:', err.message);
  process.exit(1);
});
