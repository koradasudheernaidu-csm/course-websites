import type { Metadata } from 'next';
import './globals.css';

const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'CourseBridge Learning Demo';

export const metadata: Metadata = {
  title: `${issuerName} | Online Courses & Certificates`,
  description: 'A demonstration online-learning portal for issuing, sharing and checking course certificate records.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
