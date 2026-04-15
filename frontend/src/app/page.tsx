import Link from 'next/link';
import { Calendar, PlayCircle } from 'lucide-react';
import './home.css';

export default function Home() {
  return (
    <main className="home-container">
      <div className="home-content">
        <h1 className="home-title">Techno<span className="text-highlight">Fit</span></h1>
        <p className="home-subtitle">Tu plataforma integral de entrenamiento</p>
        
        <div className="home-buttons">
          <Link href="/rutina" className="home-btn primary">
            <Calendar size={32} strokeWidth={2} />
            <div className="home-btn-text">
              <h2>Ver Mi Rutina</h2>
              <p>Consulta tus ejercicios del día</p>
            </div>
          </Link>
          
          <Link href="/ejercicios" className="home-btn secondary">
            <PlayCircle size={32} strokeWidth={2} />
            <div className="home-btn-text">
              <h2>Ejemplos de Ejercicio</h2>
              <p>Aprende la técnica correcta</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
