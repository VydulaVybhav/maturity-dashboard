'use client';

import { usePathname } from 'next/navigation';
import NavBar from './NavBar';

export default function ConditionalNavBar() {
  const pathname = usePathname();

  // Hide NavBar on home page
  if (pathname === '/') {
    return null;
  }

  return <NavBar />;
}
