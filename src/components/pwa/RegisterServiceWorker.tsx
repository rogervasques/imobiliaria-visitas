'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('[PWA] Service Worker registrado com sucesso! Escopo:', registration.scope);
        } catch (err) {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        }
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}
