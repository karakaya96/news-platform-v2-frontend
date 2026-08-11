export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://news-v2-api.karakaya-mk96.workers.dev/api/news/venezuela-da-depremlerin-yarattigi-yikim-uydu-kamerasinda-1782572557',
      {
        cache: 'no-store',
      }
    );
    const data = await res.json();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      dataKeys: data.data ? Object.keys(data.data) : null,
      error: data.error,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
