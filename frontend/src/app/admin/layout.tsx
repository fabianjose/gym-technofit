"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Dumbbell, LogOut, Tag, CreditCard, Percent, FileText, Settings, Smartphone, UploadCloud, MessageSquare } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token && !pathname.includes('/login')) {
      router.push('/admin/login');
    }
  }, [pathname]);

  if (!mounted) return null;

  if (pathname.includes('/login')) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <aside style={{ width: '250px', backgroundColor: 'var(--panel-bg)', padding: '2rem 1rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '3rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>Techno Fit Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('dashboard') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('dashboard') ? '#fff' : 'inherit' }}><Home size={20} /> Dashboard</Link>
          <Link href="/admin/miembros" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('miembros') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('miembros') ? '#fff' : 'inherit' }}><Users size={20} /> Miembros</Link>
          <Link href="/admin/categorias" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('categorias') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('categorias') ? '#fff' : 'inherit' }}><Tag size={20} /> Categorías</Link>
          <Link href="/admin/maquinas" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('maquinas') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('maquinas') ? '#fff' : 'inherit' }}><Dumbbell size={20} /> Máquinas</Link>
          <Link href="/admin/planes" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('planes') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('planes') ? '#fff' : 'inherit' }}><CreditCard size={20} /> Suscripciones</Link>
          <Link href="/admin/facturacion" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('facturacion') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('facturacion') ? '#fff' : 'inherit' }}><FileText size={20} /> Facturación</Link>
          <Link href="/admin/configuracion" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('configuracion') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('configuracion') ? '#fff' : 'inherit' }}><Settings size={20} /> Configuración</Link>
          <Link href="/admin/whatsapp" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('whatsapp') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('whatsapp') ? '#fff' : 'inherit' }}><Smartphone size={20} /> WhatsApp</Link>
          <Link href="/admin/carga-masiva" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('carga-masiva') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('carga-masiva') ? '#fff' : 'inherit' }}><UploadCloud size={20} /> Carga CSV</Link>
          <Link href="/admin/mensajes" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: pathname.includes('mensajes') ? 'var(--primary-color)' : 'transparent', color: pathname.includes('mensajes') ? '#fff' : 'inherit' }}><MessageSquare size={20} /> Mensajes Masivos</Link>
        </nav>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--danger)', marginTop: 'auto' }}>
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
