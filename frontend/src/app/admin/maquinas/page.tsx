/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, Video, Image as ImageIcon, CheckCircle, Tag, Edit2 } from 'lucide-react';

export default function MaquinasPage() {
  const [machines, setMachines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState<any>({ name: '', description: '', category: 'General', showInPublic: true });
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => {
    fetchMachines();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get('/api/categories');
    setCategories(res.data);
    if (res.data.length > 0) {
      setForm((prev: any) => ({ ...prev, category: res.data[0].name }));
    }
  };

  const fetchMachines = async () => {
    const res = await axios.get('/api/machines');
    setMachines(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      await axios.put(`/api/machines/${form.id}`, form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    } else {
      await axios.post('/api/machines', form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    }
    setForm({ id: undefined, name: '', description: '', category: categories.length > 0 ? (categories[0] as any).name : 'General', showInPublic: true });
    fetchMachines();
  };

  const handleUpload = async (id: number, file: File, type: 'photo' | 'video') => {
    setLoadingMsg(`Subiendo ${type}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`/api/machines/${id}/${type}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
      });
      await fetchMachines();
    } finally {
      setLoadingMsg('');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ flex: '1', minWidth: '350px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="title" style={{ textAlign: 'left', fontSize: '1.8rem', margin: 0 }}>Gestión de Máquinas</h2>
          {loadingMsg && <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>{loadingMsg}</span>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '0.75rem', flex: 1, minWidth: '200px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
          />
          <select 
            value={filterCat} 
            onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '0.75rem', minWidth: '180px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
          {machines
            .filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter((m: any) => filterCat ? (m.category?.name || m.category) === filterCat : true)
            .map((m: any) => (
            <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', alignItems: 'center', padding: '1.2rem', backgroundColor: 'var(--bg-color)', borderLeft: `4px solid ${m.showInPublic ? 'var(--primary-color)' : 'var(--text-muted)'}` }}>
              {m.photoUrl ? (
                <img src={`${m.photoUrl}`} alt={m.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              ) : m.videoUrl ? (
                <video src={`${m.videoUrl}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} muted loop playsInline autoPlay />
              ) : (
                <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--panel-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                  <ImageIcon size={24} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>{m.name}</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Tag size={14} color="var(--primary-color)"/> {m.category?.name || m.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: m.showInPublic ? 'rgba(0, 210, 138, 0.1)' : 'rgba(255,255,255,0.1)', color: m.showInPublic ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                    {m.showInPublic ? 'Público' : 'Oculto'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Botón Subir Foto */}
                <label style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', 
                  backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '12px', width: '70px',
                  border: m.photoUrl ? '1px solid var(--success)' : '1px dashed var(--border-color)',
                  transition: 'all 0.2s ease'
                }} className="hover-lift">
                  <div style={{ 
                    backgroundColor: m.photoUrl ? 'var(--success)' : 'var(--panel-bg)',
                    color: m.photoUrl ? '#000' : 'var(--text-muted)',
                    padding: '0.4rem', borderRadius: '50%', display: 'flex' 
                  }}>
                    <Camera size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: m.photoUrl ? 'var(--success)' : 'var(--text-light)', fontWeight: 'bold' }}>
                    FOTO
                  </span>
                  <input type="file" accept="image/*" onChange={e => { if(e.target.files && e.target.files[0]) handleUpload(m.id, e.target.files[0], 'photo') }} style={{ display: 'none' }} />
                </label>

                {/* Botón Subir Video */}
                <label style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', 
                  backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '12px', width: '70px',
                  border: m.videoUrl ? '1px solid var(--primary-color)' : '1px dashed var(--border-color)',
                  transition: 'all 0.2s ease'
                }} className="hover-lift">
                  <div style={{ 
                    backgroundColor: m.videoUrl ? 'var(--primary-color)' : 'var(--panel-bg)',
                    color: m.videoUrl ? '#000' : 'var(--text-muted)',
                    padding: '0.4rem', borderRadius: '50%', display: 'flex' 
                  }}>
                    <Video size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: m.videoUrl ? 'var(--primary-color)' : 'var(--text-light)', fontWeight: 'bold' }}>
                    VIDEO
                  </span>
                  <input type="file" accept="video/mp4,video/webm" onChange={e => { if(e.target.files && e.target.files[0]) handleUpload(m.id, e.target.files[0], 'video') }} style={{ display: 'none' }} />
                </label>

                {/* Botón Editar */}
                <button onClick={() => setForm(m)} style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', 
                  backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '12px', width: '70px',
                  border: '1px solid var(--primary-color)',
                  transition: 'all 0.2s ease'
                }} className="hover-lift">
                  <div style={{ 
                    backgroundColor: 'var(--primary-color)',
                    color: '#000',
                    padding: '0.4rem', borderRadius: '50%', display: 'flex' 
                  }}>
                    <Edit2 size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    EDITAR
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '350px', padding: '2rem', position: 'sticky', top: '5rem', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
            <ImageIcon size={20} color="#000" />
          </div>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Añadir Ejercicio</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Nombre del Ejercicio</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)' }} placeholder="Ej: Press de Banca" />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Categoría</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}>
              {categories.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              {categories.length === 0 && <option value="General">General (Por defecto)</option>}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Descripción / Tips (Opcional)</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', resize: 'vertical' }} placeholder="Instrucciones breves..." />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', backgroundColor: 'var(--bg-color)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <input type="checkbox" checked={form.showInPublic} onChange={e => setForm({...form, showInPublic: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem', marginBottom: 0 }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Mostrar en Catálogo Público</span>
          </label>
          <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> Guardar Ejercicio
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-lift:hover {
          transform: translateY(-2px);
          background-color: rgba(255,255,255,0.05) !important;
        }
      `}} />
    </div>
  );
}
