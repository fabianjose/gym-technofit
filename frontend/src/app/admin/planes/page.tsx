"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Trash2, Edit2, Plus, Percent, ToggleRight, ToggleLeft } from 'lucide-react';

export default function SuscripcionesPage() {
  const [activeTab, setActiveTab] = useState<'planes' | 'descuentos'>('planes');

  // --- PLANES STATE ---
  const [plans, setPlans] = useState([]);
  const [planForm, setPlanForm] = useState({ id: null, name: '', price: '', durationDays: 10000 });

  // --- DESCUENTOS STATE ---
  const [discounts, setDiscounts] = useState([]);
  const [descForm, setDescForm] = useState({ id: null, name: '', percentage: '', isActive: true });

  useEffect(() => {
    fetchPlans();
    fetchDiscounts();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/plans');
      setPlans(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/discounts');
      setDiscounts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- PLANES HANDLERS ---
  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      name: planForm.name,
      price: Number(planForm.price),
      durationDays: 10000
    };
    if (planForm.id) {
      await axios.patch(`http://localhost:3001/api/plans/${planForm.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post('http://localhost:3001/api/plans', payload, { headers: { Authorization: `Bearer ${token}` } });
    }
    setPlanForm({ id: null, name: '', price: '', durationDays: 10000 });
    fetchPlans();
  };

  const handlePlanDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este plan?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchPlans();
    }
  };

  // --- DESCUENTOS HANDLERS ---
  const handleDescSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      name: descForm.name,
      percentage: Number(descForm.percentage),
      isActive: descForm.isActive
    };
    try {
      if (descForm.id) {
        await axios.patch(`http://localhost:3001/api/discounts/${descForm.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:3001/api/discounts', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setDescForm({ id: null, name: '', percentage: '', isActive: true });
      fetchDiscounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar descuento');
      console.error(err);
    }
  };

  const handleToggleDesc = async (discount: any) => {
    const token = localStorage.getItem('token');
    await axios.patch(`http://localhost:3001/api/discounts/${discount.id}`, { isActive: !discount.isActive }, { headers: { Authorization: `Bearer ${token}` } });
    fetchDiscounts();
  };

  const handleDescDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este descuento?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/discounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchDiscounts();
    }
  };

  // --- RENDER ---
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* TABS HEADER */}
      <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CreditCard size={28} /> Suscripciones y Promociones
      </h2>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('planes')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'planes' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'planes' ? '3px solid var(--primary-color)' : '3px solid transparent',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px'
          }}>
          <CreditCard size={20} /> Planes
        </button>
        <button 
          onClick={() => setActiveTab('descuentos')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'descuentos' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'descuentos' ? '3px solid var(--primary-color)' : '3px solid transparent',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px'
          }}>
          <Percent size={20} /> Descuentos
        </button>
      </div>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap-reverse' }}>
        
        {/* LIST SECTION */}
        <div style={{ flex: '1', minWidth: '350px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
            
            {activeTab === 'planes' && plans.map((p: any) => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', backgroundColor: 'var(--bg-color)', borderLeft: `4px solid var(--primary-color)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', color: '#fff' }}>{p.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Precio: ${Number(p.price).toLocaleString()} COP</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setPlanForm({ ...p, price: p.price.toString(), durationDays: 10000 })} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handlePlanDelete(p.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {activeTab === 'planes' && plans.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>No hay planes creados todavía.</div>
            )}

            {activeTab === 'descuentos' && discounts.map((d: any) => (
              <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', backgroundColor: 'var(--bg-color)', borderLeft: `4px solid ${d.isActive ? 'var(--primary-color)' : 'var(--text-muted)'}`, opacity: d.isActive ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', color: '#fff' }}>{d.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Porcentaje: {Number(d.percentage)}%</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: d.isActive ? 'var(--primary-color)' : 'var(--danger)' }}>{d.isActive ? 'Activo' : 'Inactivo'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleToggleDesc(d)} style={{ background: 'none', border: 'none', color: d.isActive ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer' }} title={d.isActive ? 'Desactivar' : 'Activar'}>
                      {d.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => setDescForm({ ...d, percentage: d.percentage.toString() })} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDescDelete(d.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {activeTab === 'descuentos' && discounts.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>No hay descuentos creados todavía.</div>
            )}
            
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="card" style={{ width: '100%', maxWidth: '350px', position: 'sticky', top: '2rem', padding: '2rem' }}>
          
          {activeTab === 'planes' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                  {planForm.id ? <Edit2 size={20} color="#000" /> : <Plus size={20} color="#000" />}
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{planForm.id ? 'Editar Plan' : 'Añadir Plan'}</h3>
              </div>
              <form onSubmit={handlePlanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Nombre del Plan</label>
                  <input value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: Mensualidad VIP" />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Precio</label>
                  <input type="number" step="1000" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: 80000" />
                </div>
                {planForm.id && (
                  <button type="button" onClick={() => setPlanForm({ id: null, name: '', price: '', durationDays: 10000 })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'right', fontSize: '0.9rem' }}>Cancelar Edición</button>
                )}
                <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <CreditCard size={18} /> {planForm.id ? 'Actualizar Plan' : 'Guardar Plan'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'descuentos' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                  {descForm.id ? <Edit2 size={20} color="#000" /> : <Plus size={20} color="#000" />}
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{descForm.id ? 'Editar Descuento' : 'Añadir Descuento'}</h3>
              </div>
              <form onSubmit={handleDescSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Descripción Corta</label>
                  <input value={descForm.name} onChange={e => setDescForm({...descForm, name: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: Estudiante Promedio" />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Valor Porcentual (%)</label>
                  <input type="number" min="0" max="100" value={descForm.percentage} onChange={e => setDescForm({...descForm, percentage: e.target.value})} required style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} placeholder="Ej: 15" />
                </div>
                {descForm.id && (
                  <button type="button" onClick={() => setDescForm({ id: null, name: '', percentage: '', isActive: true })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'right', fontSize: '0.9rem' }}>Cancelar Edición</button>
                )}
                <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <Percent size={18} /> {descForm.id ? 'Actualizar Descuento' : 'Guardar Descuento'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
