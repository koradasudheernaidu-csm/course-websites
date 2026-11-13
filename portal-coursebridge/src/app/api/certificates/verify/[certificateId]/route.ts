import { NextResponse } from 'next/server';

export async function GET(_request: Request, context: { params: Promise<{ certificateId: string }> }) {
  const apiUrl = process.env.CERTIFICATE_API_URL;
  const issuerId = process.env.ISSUER_ID;
  if (!apiUrl || !issuerId) {
    return NextResponse.json({ success: false, status: 'ERROR', message: 'Issuer portal environment variables are not configured.' }, { status: 500 });
  }
  const { certificateId } = await context.params;
  try {
    const url = new URL(`${apiUrl.replace(/\/$/, '')}/api/certificates/verify/${encodeURIComponent(certificateId)}`);
    url.searchParams.set('issuerId', issuerId);
    const response = await fetch(url.toString(), { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, status: 'ERROR', message: 'Could not reach the certificate API.' }, { status: 502 });
  }
}
