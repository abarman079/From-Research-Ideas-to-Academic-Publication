import type { ReactNode } from 'react';
import '../globals.css';

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
