import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiUrl = process.env.CERTIFICATE_API_URL;
  const issuerId = process.env.ISSUER_ID;
  const issuerName = process.env.ISSUER_NAME;
  const issuerKey = process.env.ISSUER_API_KEY;
  if (!apiUrl || !issuerId || !issuerName || !issuerKey || !process.env.ISSUER_FORM_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Issuer portal environment variables are not configured.' }, { status: 500 });
  }
  const submittedPassword = request.headers.get('x-issuer-password') || '';
  if (submittedPassword !== process.env.ISSUER_FORM_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Issuer access code is incorrect.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/certificates/create`, {
      method: 'POST', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'x-issuer-key': issuerKey },
      body: JSON.stringify({ ...body, issuerId, issuerName })
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Could not reach the certificate API.' }, { status: 502 });
  }
}
