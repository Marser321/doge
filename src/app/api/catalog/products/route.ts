import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/server/http';
import { listProducts } from '@/lib/server/repository';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const products = await listProducts({
      featured: url.searchParams.get('featured') === 'true',
      category: url.searchParams.get('category') || undefined,
      exclude: url.searchParams.get('exclude') || undefined,
      staff: false,
    });
    return NextResponse.json(products);
  } catch (error) {
    // A brand-new preview can render its public shell before its server-only
    // backend variables are provisioned. Keep the catalogue empty rather than
    // emitting a browser-visible 500; CRM routes remain fail-closed.
    if (error instanceof Error && error.message.includes('Supabase no está configurado')) {
      return NextResponse.json([]);
    }
    return errorResponse(error);
  }
}
