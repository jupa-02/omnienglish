import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OmniEnglish Frontier | Accelerated English & Economics ESP Platform',
  description:
    'Advanced English acquisition platform for Spanish native speakers. FSRS spaced repetition, interactive Duolingo-style skill trees, and quantitative economics laboratories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${nunito.className} min-h-screen mesh-gradient text-slate-800 antialiased selection:bg-purple-500/30 selection:text-purple-900`}>
        {children}
      </body>
    </html>
  );
}
