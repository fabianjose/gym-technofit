import Link from 'next/link';
import { Calendar, PlayCircle } from 'lucide-react';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <h1 className="title" style={{ fontSize: '4rem', marginBottom: '4rem', color: 'var(--primary-color)' }}>Techno Fit</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '600px' }}>
        <Link href="/rutina" className="btn-primary" style={{ padding: '2rem', fontSize: '2rem', borderRadius: '16px' }}>
          <Calendar size={48} />
          Ver Mi Rutina
        </Link>
        
        <Link href="/ejercicios" className="btn-secondary" style={{ padding: '2rem', fontSize: '2rem', borderRadius: '16px' }}>
          <PlayCircle size={48} />
          Ejemplos de Ejercicio
        </Link>
      </div>
    </main>
  );
}
