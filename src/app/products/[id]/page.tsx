import { redirect } from 'next/navigation';

export default async function LegacyProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/store/products/${encodeURIComponent(id)}`);
}
