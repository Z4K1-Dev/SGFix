'use client';

import { useEffect } from 'react';
import { register } from '@/lib/sw-registration';

export default function ServiceWorkerProvider() {
  useEffect(() => {
    // Register service worker
    register();
  }, []);

  return null;
}