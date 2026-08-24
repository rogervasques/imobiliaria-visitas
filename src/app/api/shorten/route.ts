import { NextRequest, NextResponse } from 'next/server';
import { getShortMapsUrl, shortenUrl } from '@/lib/maps';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, endereco } = body;

    if (endereco) {
      const shortUrl = await getShortMapsUrl(endereco);
      return NextResponse.json({ success: true, shortUrl });
    }

    if (url) {
      const shortUrl = await shortenUrl(url);
      return NextResponse.json({ success: true, shortUrl });
    }

    return NextResponse.json({ error: 'URL ou endereço não informado' }, { status: 400 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao encurtar link';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
