"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Wallet, Edit2, Trash2, Plus, ToggleRight, ToggleLeft } from 'lucide-react';

export default function MetodosPagoPage() {
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', isActive: true });

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:3001/api/payment-methods', { headers: { Authorization: `Bearer ${token}` } });
    setMethods(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const payload = { name: form.name, isActive: form.isActive };
    try {
      if (form.id) {
        await axios.patch(`http://localhost:3001/api/payment-methods/${form.id}`, payload, { headers });
      } else {
        await axios.post('http://localhost:3001/api/payment-methods', payload, { headers });
      }
      setForm({ id: null, name: '', isActive: true });
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleToggle = async (m: any) => {
    const token = localStorage.getItem('token');
    await axios.patch(`http://localhost:3001/api/payment-methods/${m.id}`, { isActive: !m.isActive }, { headers: { Authorization: `Bearer ${token}` } });
    fetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este método de pago?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/api/payment-methods/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetch();
  };

  return (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap-reverse', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ flex: '1', minWidth: '300px' }}>
        <h2 className="title" style={{ textAlign: 'left', fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wallet size={28} /> Métodos de Pago
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {methods.map((m: any) => (
            <div key={m.id} className="card" style={{ padding: '1.2rem', borderLeft: `4px solid ${m.isActive ? 'var(--primary-color)' : 'var(--text-muted)'}`, opacity: m.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{m.name}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: m.isActive ? 'var(--primary-color)' : 'var(--text-muted)' }}>{m.isActive ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => handleToggle(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.isActive ? 'var(--success)' : 'var(--text-muted)' }} title={m.isActive ? 'Desactivar' : 'Activar'}>
                    {m.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => setForm({ id: m.id, name: m.name, isActive: m.isActive })} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {methods.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin métodos registrados.</p>}
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '320px', position: 'sticky', top: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
            {form.id ? <Edit2 size={20} color="#000" /> : <Plus size={20} color="#000" />}
          </div>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{form.id ? 'Editar Método' : 'Nuevo Método'}</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Nombre del Método</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Nequi, Efectivo..." style={{ marginBottom: 0, padding: '0.75rem', width: '100%', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Activo</span>
          </label>
          {form.id && (
            <button type="button" onClick={() => setForm({ id: null, name: '', isActive: true })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'right' }}>Cancelar</button>
          )}
          <button type="submit" className="btn-primary" style={{ padding: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={18} /> {form.id ? 'Actualizar' : 'Guardar Método'}
          </button>
        </form>
      </div>
    </div>
  );
}
