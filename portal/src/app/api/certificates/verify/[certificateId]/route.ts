import { NextResponse } from 'next/server';

export async function GET(_request: Request, context: { params: Promise<{ certificateId: string }> }) {
  const apiUrl = process.env.CERTIFICATE_API_URL;
  if (!apiUrl) return NextResponse.json({ success: false, status: 'ERROR', message: 'Certificate API URL is not configured.' }, { status: 500 });
  const { certificateId } = await context.params;
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/certificates/verify/${encodeURIComponent(certificateId)}`, { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, status: 'ERROR', message: 'Could not reach the certificate API.' }, { status: 502 });
  }
}
