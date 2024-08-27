import React from 'react';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';

import { cn } from '@/lib/utils';

import './globals.css';

import localFont from 'next/font/local';
import Script from 'next/script';
import { CookiesProvider } from 'react-cookie';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = localFont({
  src: '../../public/assets/fonts/CalSans-SemiBold.woff2',
  variable: '--font-heading',
});

// TODO
export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Datastream URL
  // https://experience.adobe.com/#/@cjmprodnld2/sname:prod/data-collection/scramjet/1d48eeb6-e7ff-4490-902f-8ba0954a1a70/

  return (
    <html lang="en" suppressHydrationWarning>
      <Script id="config-alloy">
        {`
        !function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||
        []).push(o),n[o]=function(){var u=arguments;return new Promise(
        function(i,l){n.setTimeout(function(){n[o].q.push([i,l,u])})})},n[o].q=[])})}
        (window,["alloy"]);
        const datastreamId = '1d48eeb6-e7ff-4490-902f-8ba0954a1a70';
        const orgId = '4DA0571C5FDC4BF70A495FC2@AdobeOrg';
        const debugEnabled = true;
        const clickCollectionEnabled = false;
        const alloyOption = { 
          datastreamId, 
          orgId, 
          debugEnabled,
          clickCollectionEnabled,
        };
        alloy('configure', alloyOption);
      `}
      </Script>
      <Script
        src={'https://cdn1.adoberesources.net/alloy/2.21.1/alloy.min.js'}
      ></Script>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
