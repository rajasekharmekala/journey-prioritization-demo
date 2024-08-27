'use client';

import React from 'react';
import { CookiesProvider } from 'react-cookie';

export default function CookiesWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
