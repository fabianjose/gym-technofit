"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Tag, Trash2, Edit2, Plus, CheckCircle } from 'lucide-react';

export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (form.id) {
      await axios.put(`/api/categories/${form.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post('/api/categories', form, { headers: { Authorization: `Bearer ${token}` } });
    }
    setForm({ id: null, name: '', description: '' });
    fetchCategories();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCategories();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap-reverse', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ flex: '1', minWidth: '350px' }}>
        <h2 className="title" style={{ textAlign: 'left', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Gestión de Categorías</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {categories.map((c: any) => (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', backgroundColor: 'var(--bg-color)', borderLeft: `4px solid var(--primary-color)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', color: '#fff' }}>{c.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.description || 'Sin descripción'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setForm(c)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem' }}>
              No hay categorías creadas todavía.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '350px', position: 'sticky', top: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
            {form.id ? <Edit2 size={20} color="#000" /> : <Plus size={20} color="#000" />}
          </div>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{form.id ? 'Editar Categoría' : 'Añadir Categoría'}</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Nombre</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)' }} placeholder="Ej: Pecho, Espalda..." />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Descripción (Opcional)</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', resize: 'vertical' }} placeholder="Detalles de la categoría..." />
          </div>
          
          <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> {form.id ? 'Actualizar' : 'Guardar Categoría'}
          </button>
          
          {form.id && (
            <button type="button" onClick={() => setForm({ id: null, name: '', description: '' })} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar Edición
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
