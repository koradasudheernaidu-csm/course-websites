# Credential Platform starter

This starter contains one shared Express/MongoDB API and one reusable Next.js certificate portal. Deploy the portal twice on Vercel with different issuer environment variables to create two separate issuer websites that share the same API/database.

## Important scope and trust note

This MVP saves certificate metadata in MongoDB, generates a printable PDF with a QR code, and verifies the corresponding database record/status. It does **not** yet create a signed W3C Verifiable Credential. A database record or QR lookup is not equivalent to cryptographic proof. Do not describe these MVP results as a cryptographically verified credential or an official NPTEL-issued certificate. Use an explicitly labelled demo issuer unless you have authorization from the institution.

## 1. MongoDB

If you cannot obtain the existing project's MongoDB connection string from its owner/admin, create a MongoDB Atlas cluster you control. In Atlas, create a database user and add an IP access list entry suitable for your hosting environment. Copy the application connection string and replace its username/password placeholders. Do not put this URI in the frontend or commit it to Git.

The API uses a database named `learner_credentials` (you can also include that name in the URI). Atlas requires a database user and an allowed network entry; see MongoDB's connection guide: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/.

## 2. Run API locally

```bash
cd api
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGODB_URI`: your Atlas connection string.
- `ISSUER_API_KEYS`: set two long random secrets, for example `NPTEL-DEMO:secret1,ANITS-DEMO:secret2`.
- `ALLOWED_ORIGINS`: initially `http://localhost:3000`.

Then:

```bash
npm run dev
```

Check `http://localhost:5000/api/health`. It should say `database: connected`.

## 3. Deploy API to Render

Create a new Web Service from the `api` folder/repository. Use:
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env` in Render's Environment page. Do not upload `.env` to GitHub.

After deployment, open `/api/health`. It should return `database: connected`.

## 4. Run portal locally

```bash
cd portal
npm install
cp .env.example .env.local
```

Set the server-side values in `.env.local`:
- `CERTIFICATE_API_URL=http://localhost:5000` for local development.
- `ISSUER_ID=NPTEL-DEMO`
- `ISSUER_NAME=NPTEL Demonstration Issuer`
- `ISSUER_API_KEY` must exactly match that issuer's key in the API's `ISSUER_API_KEYS`.
- `ISSUER_FORM_PASSWORD` is a private admin access code checked by the Next.js server before the issuer API is called.
- `NEXT_PUBLIC_ISSUER_NAME=NPTEL Demonstration Issuer`

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 5. Test end-to-end

1. Open `/create` and create a test certificate.
2. Confirm the API returns a unique certificate ID.
3. Download the PDF; scan its QR with a phone or open its QR URL.
4. The verification page should display the stored record.
5. Change one character in the ID; it should show `CERTIFICATE NOT FOUND`.

## 6. Deploy two distinct Vercel sites

Push `portal` to a GitHub repository. Import that same repository twice in Vercel, setting the Root Directory to `portal` for each project. For each Vercel project, set:

Shared:
- `CERTIFICATE_API_URL=https://YOUR-API.onrender.com`

Site 1:
- `ISSUER_ID=NPTEL-DEMO`
- `ISSUER_NAME=NPTEL Demonstration Issuer`
- `NEXT_PUBLIC_ISSUER_NAME=NPTEL Demonstration Issuer`
- `ISSUER_API_KEY` = NPTEL key configured on API
- `ISSUER_FORM_PASSWORD` = private admin code for the NPTEL portal

Site 2:
- `ISSUER_ID=ANITS-DEMO`
- `ISSUER_NAME=ANITS Demonstration Issuer`
- `NEXT_PUBLIC_ISSUER_NAME=ANITS Demonstration Issuer`
- `ISSUER_API_KEY` = ANITS key configured on API
- `ISSUER_FORM_PASSWORD` = private admin code for the ANITS portal

Set `ALLOWED_ORIGINS` on the API to both Vercel origins, comma-separated, then redeploy the API.

The API keys are only used by Next.js server route handlers and must **not** be named `NEXT_PUBLIC_*`.

## 7. Existing Learner Credential Wallet integration

The current app has a student lookup integration that calls `https://certificate-3g1x.onrender.com/api/certificates/student` and expects a credential-shaped response. This starter deliberately does not change that integration or return unsigned objects pretending to be verifiable credentials. To integrate the new issuer data safely, the next step is to implement the same `/student` contract using properly constructed and cryptographically signed credentials, then add the issuer's DID/key to the trust configuration understood by the wallet. Until that is implemented and tested, demonstrate the two web portals' database-backed verification separately from wallet cryptographic verification.

## API routes

- `GET /` health banner
- `GET /api/health` MongoDB connectivity
- `POST /api/certificates/create` issuer-authenticated creation
- `GET /api/certificates/verify/:certificateId` public record/status check
- `POST /api/certificates/revoke/:certificateId` issuer-authenticated revocation
