import { redirect } from 'next/navigation';

export default async function ShortPublicImovelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const queryString = new URLSearchParams(query as Record<string, string>).toString();
  redirect(`/imovel/${id}${queryString ? `?${queryString}` : ''}`);
}
