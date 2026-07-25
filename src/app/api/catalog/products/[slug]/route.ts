import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/server/http';
import { getProductBySlug } from '@/lib/server/repository';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    return NextResponse.json(await getProductBySlug(slug, false));
  } catch (error) {
    if (error instanceof Error && error.message.includes('Supabase no está configurado')) {
      return NextResponse.json({ error: 'El catálogo no está disponible todavía.' }, { status: 404 });
    }
    return errorResponse(error);
  }
}
