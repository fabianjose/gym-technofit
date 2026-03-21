/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, PlayCircle, X, RotateCw } from 'lucide-react';
import Link from 'next/link';

export default function EjerciciosPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/public/machines').then(res => {
      // Filter only public ones
      setMachines(res.data.filter((m: any) => m.showInPublic !== false));
    });
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link href="/" className="btn-secondary" style={{ padding: '0.6rem 1rem', borderRadius: '30px', fontSize: '0.9rem', flex: 'none' }}>
          <ArrowLeft size={18} /> Volver
        </Link>
        <h2 className="title" style={{ margin: 0, textAlign: 'left', flex: 1, fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>Catálogo de Ejercicios</h2>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
        {machines.map(m => (
          <div key={m.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.1rem' }}>{m.name}</h3>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{m.category || 'General'}</span>
            </div>
            {m.photoUrl ? (
              <img src={`http://localhost:3001${m.photoUrl}`} alt={m.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
            ) : (
              <div style={{ width: '100%', height: '140px', backgroundColor: '#2a2a3e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Sin foto</div>
            )}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1, marginBottom: '0.5rem' }}>{m.description}</p>
            {m.videoUrl && (
              <button 
                onClick={() => setSelectedVideo(m.videoUrl)}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: 'auto' }}>
                <PlayCircle size={20} /> Ver Video
              </button>
            )}
          </div>
        ))}
      </div>

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
              style={{ background: 'var(--primary-color)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <RotateCw size={24} /> Repetir
            </button>

            <button 
              onClick={() => setSelectedVideo(null)} 
              style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <X size={24} /> Cerrar Video
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
