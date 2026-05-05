// ============================================
// App Layout for Vite
// ============================================

import '@/shared/styles/globals/index.scss';
import React from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Konstantin Atroshchenko - Full Stack Developer</title>
        <meta
          name="description"
          content="Portfolio of Maximus Dayton, a full stack developer specializing in React, Node.js, and modern web technologies."
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
