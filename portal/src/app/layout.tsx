import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'Academic Credential Office';

export const metadata: Metadata = {
  title: `${issuerName} | Academic Credential Register`,
  description: 'Issue, share and verify demonstration academic achievement records.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
