"use client";
import { useState, useRef } from 'react';
import axios from 'axios';
import { Search, XCircle, ArrowLeft, PlayCircle, X, RotateCw } from 'lucide-react';
import Link from 'next/link';

export default function RutinaPage() {
  const [cedula, setCedula] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:3001/api/public/routine?cedula=${cedula}`);
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Miembro no encontrado o sin rutina asignada.');
      setData(null);
    }
  };

  const handleClear = () => {
    setData(null);
    setCedula('');
    setError('');
  };

  if (data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1.5rem', backgroundColor: 'var(--panel-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.5rem' }}>Rutina de: {data.member.fullName}</h2>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={handleClear} className="btn-secondary" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', borderRadius: '30px' }}>
              <XCircle size={18} /> Limpiar Búsqueda
            </button>
            <Link href="/" className="btn-primary" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', borderRadius: '30px' }}>
              <ArrowLeft size={18} /> Ir al Inicio
            </Link>
          </div>
        </header>

        <main style={{ padding: '1rem', flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            gap: '1rem', 
            alignItems: 'flex-start' 
          }}>
            {data.calendar.map((day: any) => {
              const isRest = !day.exercises || day.exercises.length === 0;
              const entryDateObj = new Date(day.entryDate);
              const today = new Date();
              const isToday = entryDateObj.getUTCFullYear() === today.getFullYear() && 
                              entryDateObj.getUTCMonth() === today.getMonth() && 
                              entryDateObj.getUTCDate() === today.getDate();

              return (
                <div key={day.id} style={{ 
                  flex: '1 1 260px',
                  maxWidth: '350px',
                  backgroundColor: isRest ? 'rgba(0,0,0,0.2)' : 'var(--panel-bg)',
                  border: isToday ? '2px solid var(--primary-color)' : (isRest ? '1px dashed var(--border-color)' : '1px solid var(--border-color)'),
                  boxShadow: isToday ? '0 0 15px rgba(0, 210, 138, 0.15)' : 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {isToday && (
                    <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--primary-color)', color: '#000', padding: '0.2rem 0.8rem', borderBottomLeftRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 2 }}>
                      HOY
                    </div>
                  )}
                  <div style={{ padding: '1rem', backgroundColor: isToday ? 'rgba(0, 210, 138, 0.1)' : (isRest ? 'transparent' : 'rgba(0, 210, 138, 0.05)'), borderBottom: isToday ? '1px solid rgba(0,210,138,0.3)' : '1px solid var(--border-color)', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: isToday ? 'var(--primary-color)' : (isRest ? 'var(--text-muted)' : 'var(--primary-color)'), fontSize: '1.2rem', textTransform: 'capitalize', fontWeight: isToday ? 'bold' : 'normal' }}>
                      {entryDateObj.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' })}
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: isToday ? '#fff' : 'var(--text-muted)', fontWeight: isToday ? 'bold' : 'normal' }}>
                      {entryDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                    </p>
                  </div>
                  
                  <div style={{ padding: '1rem', flex: 1 }}>
                    {isRest ? (
                      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {day.notes || 'Día de Descanso'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {day.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ℹ️ {day.notes}</p>}
                        {day.exercises.sort((a:any, b:any) => a.orderIndex - b.orderIndex).map((ex: any, idx: number) => (
                          <div key={ex.id} style={{ padding: '0.5rem 0.6rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)', fontSize: '0.8rem', lineHeight: '1.4', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                                <span style={{ color: 'var(--primary-color)', marginRight: '0.4rem', fontSize: '0.85rem', flexShrink: 0, fontWeight: 'bold' }}>{idx + 1}.</span>
                                <span style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#fff'}}>{ex.machine?.name}</span>
                                {ex.machine?.category && (
                                  <span style={{ marginLeft: '0.4rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '4px', textTransform: 'uppercase', flexShrink: 0 }}>
                                    {ex.machine.category}
                                  </span>
                                )}
                              </div>
                              {ex.machine?.videoUrl && (
                                <button
                                  onClick={() => setSelectedVideo(ex.machine.videoUrl)}
                                  title="Ver Video"
                                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}
                                >
                                  <PlayCircle size={22} strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                            <div style={{ color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.2rem', fontSize: '0.75rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '4px' }}>
                              <span>Series: <strong style={{color: 'var(--primary-color)'}}>{ex.sets}</strong></span>
                              <span>Reps: <strong style={{color: '#fff'}}>{ex.reps}</strong></span>
                              <span>Desc: <strong style={{color: '#fff'}}>{ex.restSeconds || 0}s</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {selectedVideo && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem', zIndex: 10000 }}>
              <button 
                onClick={() => {
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                }} 
                style={{ background: 'var(--primary-color)', color: '#000', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <RotateCw size={18} /> Repetir
              </button>

              <button 
                onClick={() => setSelectedVideo(null)} 
                style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <X size={18} /> Cerrar
              </button>
            </div>
            
            <video 
              ref={videoRef}
              src={`http://localhost:3001${selectedVideo}`} 
              controls 
              autoPlay 
              style={{ maxWidth: '90%', maxHeight: '80vh', borderRadius: '12px', border: '2px solid var(--primary-color)' }}
              onEnded={() => {
                timeoutRef.current = setTimeout(() => {
                  setSelectedVideo((current) => current === selectedVideo ? null : current);
                }, 5000);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '10vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', marginBottom: '2rem' }}>
        <ArrowLeft size={20} /> Volver al inicio
      </Link>
      <form onSubmit={handleSearch} className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
          <Search size={48} />
        </div>
        <h2 className="title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Buscar Rutina</h2>
        <input 
          type="number" 
          placeholder="Ingrese su número de cédula..." 
          value={cedula} 
          onChange={(e) => setCedula(e.target.value)}
          style={{ padding: '1.5rem', fontSize: '1.5rem', textAlign: 'center', borderRadius: '8px', marginBottom: '1.5rem' }}
        />
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.5rem', borderRadius: '8px' }}>Buscar</button>
      </form>
      {error && <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '1rem 2rem', borderRadius: '8px' }}>{error}</p>}
    </div>
  );
}
