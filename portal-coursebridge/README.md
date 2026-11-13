# CourseBridge Learning Demo Portal

This is the second issuer website for the Learner Credential Wallet demonstration. Its visual direction is inspired by familiar online-course platforms: white navigation, a blue learning-focused palette, course discovery cards, partner-style course listings, and a clean course-completion certificate. The brand, UI artwork, certificate layout, and sample institutions are original demo assets.

**This is not Coursera, does not use Coursera branding, and cannot issue or verify official Coursera certificates.** Do not present its output as a certificate issued by Coursera or by a real partner institution. Every page and the generated PDF identify the output as a demonstration record.

## Pages

- `/` — CourseBridge learning-demo homepage and sample course catalog.
- `/create` — protected issuer workspace with live certificate preview and PDF/QR output.
- `/verify` — manual certificate-reference lookup.
- `/verify/[certificateId]` — QR destination and certificate-specific verification.

The portal writes certificate records through the existing central API and reads them back for verification. It does not create a separate database.

## 1. Configure the backend issuer key

The shared backend must already have the certificate creation and verification routes from the shared credential-platform implementation. In `api/.env`, keep the NPTEL entry and replace the previous second issuer entry with `COURSEBRIDGE-DEMO`:

```env
ISSUER_API_KEYS=NPTEL-DEMO:YOUR_EXISTING_NPTEL_SECRET,COURSEBRIDGE-DEMO:YOUR_EXISTING_SECOND_SECRET
```

Keep the same second secret you previously generated for the second portal. Only the issuer ID changes from `ANITS-DEMO` to `COURSEBRIDGE-DEMO`. Restart the API after updating the environment.

## 2. Configure this portal

In this folder, copy the example environment file:

**Windows CMD**

```cmd
copy .env.example .env.local
```

Edit `.env.local`:

```env
CERTIFICATE_API_URL=http://localhost:5000
ISSUER_ID=COURSEBRIDGE-DEMO
ISSUER_NAME=CourseBridge Learning Demo
ISSUER_API_KEY=YOUR_EXISTING_SECOND_SECRET
ISSUER_FORM_PASSWORD=CHOOSE_A_SEPARATE_PRIVATE_ADMIN_CODE
NEXT_PUBLIC_ISSUER_NAME=CourseBridge Learning Demo
```

- `ISSUER_API_KEY` must exactly match the `COURSEBRIDGE-DEMO` key in the backend.
- `ISSUER_FORM_PASSWORD` is a separate access code that the issuer enters in `/create`.
- Never prefix either secret with `NEXT_PUBLIC_`.
- Never commit `.env.local` or share secrets in screenshots or chat.

For production, use the Render API URL in `CERTIFICATE_API_URL`, not localhost.

## 3. Install and run locally

Open CMD in this folder:

```cmd
npm install
npm run dev -- -p 3001
```

Open <http://localhost:3001>.

The other services should remain running in separate terminals:

- Backend API: <http://localhost:5000>
- First issuer portal: <http://localhost:3000>
- CourseBridge portal: <http://localhost:3001>

## 4. Test the full workflow

1. Open `/create` and enter the `ISSUER_FORM_PASSWORD` value.
2. Enter a test learner name, date of birth, course title, partner/demo institution, completion date, and duration.
3. Create the certificate record.
4. Confirm a new `COURSEBRIDGE-DEMO-...` record is written to the shared MongoDB collection.
5. Download the sample PDF. It contains a QR code that opens this portal's `/verify/[certificateId]` route.
6. Scan the QR code or open the verification URL. The portal calls the shared API with `issuerId=COURSEBRIDGE-DEMO`.
7. Change a character in the reference and verify that the lookup returns `NOT_FOUND`.

Website verification confirms a matching database record and its stored status. It is not a cryptographic signature verification. W3C Verifiable Credential signing and wallet trust-registry integration remain a separate integration task.

## 5. Deploy this portal to Vercel

Create a new Vercel project from the same GitHub repository. Set the project's **Root Directory** to the folder containing this `package.json` (`coursebridge-learning-portal` in this starter package).

Build command: `npm run build`  
Output: Next.js default  
Install command: `npm install`

Configure these Vercel environment variables using your real values:

```env
CERTIFICATE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
ISSUER_ID=COURSEBRIDGE-DEMO
ISSUER_NAME=CourseBridge Learning Demo
ISSUER_API_KEY=YOUR_EXISTING_SECOND_SECRET
ISSUER_FORM_PASSWORD=YOUR_PRIVATE_ADMIN_CODE
NEXT_PUBLIC_ISSUER_NAME=CourseBridge Learning Demo
```

Redeploy after changing environment variables. The NPTEL project remains a separate Vercel project with its own root directory and issuer credentials. Both frontends use the same Render backend and MongoDB database.

## Notes

- This portal uses the same API contract as the first website: `POST /api/certificates/create` and `GET /api/certificates/verify/:certificateId?issuerId=...`.
- The API must authorize `COURSEBRIDGE-DEMO` in `ISSUER_API_KEYS`.
- The backend's certificate model must include the base fields used by the shared portal (`certificateId`, `issuerId`, `issuerName`, `recipientName`, `dateOfBirth`, `courseName`, `description`, `issueDate`, `duration`, and `status`).
- The PDF is generated in the browser with jsPDF. MongoDB stores the certificate record, not the PDF binary.
