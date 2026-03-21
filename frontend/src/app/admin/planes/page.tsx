"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Trash2, Edit2, Plus, CheckCircle } from 'lucide-react';

export default function PlanesPage() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', price: '', durationDays: 10000 });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/plans');
      setPlans(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const payload = {
      name: form.name,
      price: Number(form.price),
      durationDays: 10000
    };

    if (form.id) {
      await axios.patch(`http://localhost:3001/api/plans/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post('http://localhost:3001/api/plans', payload, { headers: { Authorization: `Bearer ${token}` } });
    }
    setForm({ id: null, name: '', price: '', durationDays: 10000 });
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este plan?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchPlans();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap-reverse', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ flex: '1', minWidth: '350px' }}>
        <h2 className="title" style={{ textAlign: 'left', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Gestión de Planes</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {plans.map((p: any) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', backgroundColor: 'var(--bg-color)', borderLeft: `4px solid var(--primary-color)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', color: '#fff' }}>{p.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Precio: ${Number(p.price).toLocaleString()} COP</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setForm({ ...p, price: p.price.toString(), durationDays: 10000 })} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem' }}>
              No hay planes creados todavía.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '350px', position: 'sticky', top: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
            {form.id ? <Edit2 size={20} color="#000" /> : <Plus size={20} color="#000" />}
          </div>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{form.id ? 'Editar Plan' : 'Añadir Plan'}</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Nombre del Plan</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: Mensualidad VIP" />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Precio</label>
            <input type="number" step="1000" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: 80000" />
          </div>
          
          <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <CheckCircle size={18} /> {form.id ? 'Actualizar' : 'Guardar Plan'}
          </button>
          
          {form.id && (
            <button type="button" onClick={() => setForm({ id: null, name: '', price: '', durationDays: 10000 })} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
              Cancelar Edición
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
