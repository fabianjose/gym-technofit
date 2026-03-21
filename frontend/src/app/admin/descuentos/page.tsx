"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Percent, Trash2, Edit2, Plus, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DescuentosPage() {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', percentage: '', isActive: true });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/discounts');
      setDiscounts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const payload = {
      name: form.name,
      percentage: Number(form.percentage),
      isActive: form.isActive
    };

    try {
      if (form.id) {
        await axios.patch(`http://localhost:3001/api/discounts/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:3001/api/discounts', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setForm({ id: null, name: '', percentage: '', isActive: true });
      fetchDiscounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar descuento');
      console.error(err);
    }
  };

  const handleToggleActive = async (discount: any) => {
    const token = localStorage.getItem('token');
    await axios.patch(`http://localhost:3001/api/discounts/${discount.id}`, { isActive: !discount.isActive }, { headers: { Authorization: `Bearer ${token}` } });
    fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este descuento?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/discounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchDiscounts();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap-reverse', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ flex: '1', minWidth: '350px' }}>
        <h2 className="title" style={{ textAlign: 'left', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Gestión de Descuentos</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {discounts.map((d: any) => (
            <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', backgroundColor: 'var(--bg-color)', borderLeft: `4px solid ${d.isActive ? 'var(--primary-color)' : 'var(--text-muted)'}`, opacity: d.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', color: '#fff' }}>{d.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Porcentaje: {Number(d.percentage)}%</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: d.isActive ? 'var(--primary-color)' : 'var(--danger)' }}>{d.isActive ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleToggleActive(d)} style={{ background: 'none', border: 'none', color: d.isActive ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer' }} title={d.isActive ? 'Desactivar' : 'Activar'}>
                    {d.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => setForm({ ...d, percentage: d.percentage.toString() })} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {discounts.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem' }}>
              No hay descuentos creados todavía.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '350px', position: 'sticky', top: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
            {form.id ? <Edit2 size={20} color="#000" /> : <Plus size={20} color="#000" />}
          </div>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{form.id ? 'Editar Descuento' : 'Añadir Descuento'}</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Nombe del Descuento</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: Black Friday" />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Porcentaje (%)</label>
            <input type="number" step="0.1" min="0" max="100" value={form.percentage} onChange={e => setForm({...form, percentage: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: 15" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
            <label htmlFor="isActive" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>¿Descuento Activo?</label>
          </div>
          
          <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <CheckCircle size={18} /> {form.id ? 'Actualizar' : 'Guardar Descuento'}
          </button>
          
          {form.id && (
            <button type="button" onClick={() => setForm({ id: null, name: '', percentage: '', isActive: true })} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
              Cancelar Edición
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
