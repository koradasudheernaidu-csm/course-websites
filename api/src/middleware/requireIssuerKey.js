export function requireIssuerKey(req, res, next) {
  const issuerId = String(req.body?.issuerId || '').trim();
  const suppliedKey = req.get('x-issuer-key');
  const configured = (process.env.ISSUER_API_KEYS || '').split(',').map((entry) => entry.trim());
  const match = configured.find((entry) => entry.startsWith(`${issuerId}:`));
  const expectedKey = match ? match.slice(issuerId.length + 1) : '';

  if (!issuerId || !expectedKey || !suppliedKey || suppliedKey !== expectedKey) {
    return res.status(401).json({ success: false, message: 'Issuer authentication failed.' });
  }

  req.issuerId = issuerId;
  next();
}
