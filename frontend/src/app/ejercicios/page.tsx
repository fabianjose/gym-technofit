"use client";
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, PlayCircle, X, RotateCw, Folder, Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function EjerciciosPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    axios.get('/api/public/machines').then(res => {
      const pubM = res.data.filter((m: any) => m.showInPublic !== false);
      setMachines(pubM);
    });
  }, []);

  const filteredMachines = machines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Agrupamos dinámicamente para las tarjetas de carpetas
  const grouped = machines.reduce((acc: any, m: any) => {
    const cat = m.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/" className="btn-secondary" style={{ padding: '0.6rem 1rem', borderRadius: '30px', fontSize: '0.9rem', flex: 'none' }}>
          <ArrowLeft size={18} /> Inicio
        </Link>
        <h2 className="title" style={{ margin: 0, textAlign: 'left', flex: 1, fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>Catálogo de Ejercicios</h2>
      </header>

      {/* FILTRO DE BÚSQUEDA */}
      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Buscar ejercicio por nombre directamente..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '0.8rem 1rem', width: '100%', borderRadius: '8px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', color: '#fff' }}
        />
      </div>

      {!isSearching && activeCat === null && (
        <>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Selecciona un Grupo Muscular</h3>
          <div className="grid-categories">
            {sortedCategories.map(cat => (
              <div 
                key={cat} 
                onClick={() => setActiveCat(cat)}
                className="card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '2rem 1rem', 
                  cursor: 'pointer',
                  textAlign: 'center',
                  backgroundColor: 'var(--panel-bg)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.2s, border-color 0.2s',
                  borderRadius: '16px'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <Folder size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{cat}</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{grouped[cat].length} ejercicios</span>
              </div>
            ))}
          </div>
        </>
      )}

      {(!isSearching && activeCat !== null) && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button 
              onClick={() => setActiveCat(null)} 
              className="btn-secondary" 
              style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              <ArrowLeft size={16} /> Volver a Grupos
            </button>
            <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{activeCat}</h3>
          </div>
        </div>
      )}

      {/* RESULTADOS: Se muestran si estamos buscando, o si entramos a una categoría */}
      {(isSearching || activeCat !== null) && (
        <div className="grid-exercises">
          {isSearching && filteredMachines.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No se encontraron ejercicios con ese nombre.
            </div>
          )}
          
          {(isSearching ? filteredMachines : (activeCat ? grouped[activeCat] : []) || []).map((m: any) => (
            <div key={m.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', lineHeight: '1.3' }}>{m.name}</h4>
                {isSearching && (
                  <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                    {m.category || 'General'}
                  </span>
                )}
              </div>

              {m.photoUrl ? (
                <img src={`${m.photoUrl}`} alt={m.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }} />
              ) : (
                <div style={{ width: '100%', height: '160px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '0.85rem', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                  <Dumbbell size={30} opacity={0.3} style={{ marginBottom: '0.5rem' }} />
                </div>
              )}

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1, marginBottom: '1rem', lineHeight: '1.4' }}>{m.description}</p>
              
              {m.videoUrl && (
                <button 
                  onClick={() => setSelectedVideo(m.videoUrl)}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', marginTop: 'auto' }}>
                  <PlayCircle size={18} /> Ver Tutorial
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reproductor modal de video */}
      {selectedVideo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem', zIndex: 10000 }}>
            <button 
              onClick={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                }
              }} 
              style={{ background: 'var(--primary-color)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <RotateCw size={20} /> Repetir
            </button>

            <button 
              onClick={() => setSelectedVideo(null)} 
              style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <X size={20} /> Cerrar
            </button>
          </div>
          
          <video 
            ref={videoRef}
            src={`${selectedVideo}`} 
            controls 
            autoPlay 
            style={{ maxWidth: '90%', maxHeight: '80vh', borderRadius: '12px', border: '2px solid var(--primary-color)', boxShadow: '0 0 30px rgba(0, 210, 138, 0.2)' }}
            onEnded={() => {
              timeoutRef.current = setTimeout(() => {
                setSelectedVideo(null);
              }, 5000);
            }}
          />
        </div>
      )}
    </div>
  );
}
