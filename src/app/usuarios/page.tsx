'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsuariosRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/equipe');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-400">
      Redirecionando para a Gestão de Equipe...
    </div>
  );
}
