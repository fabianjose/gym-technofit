"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';

export default function GymConfigPage() {
  const [phones, setPhones] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [gymName, setGymName] = useState('');
  const [nit, setNit] = useState('');
  const [address, setAddress] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/gym-config', { headers: { Authorization: `Bearer ${token}` } });
      setPhones(res.data.ownerPhones || []);
      setEmails(res.data.ownerEmails || []);
      setGymName(res.data.gymName || '');
      setNit(res.data.nit || '');
      setAddress(res.data.address || '');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:3001/api/gym-config', { 
        ownerPhones: phones, 
        ownerEmails: emails,
        gymName,
        nit,
        address
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccessMsg('Configuración guardada exitosamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
      alert('Error guardando configuración');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      <h2 className="title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Settings size={28} /> Configuración General
      </h2>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          Datos Institucionales del Gimnasio
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Esta información aparecerá impresa en las facturas digitales enviadas a los clientes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Nombre del Gimnasio</label>
            <input value={gymName} onChange={e => setGymName(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="Ej: Flex Fitness Gym" />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>NIT / RUC</label>
            <input value={nit} onChange={e => setNit(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="Ej: 900.123.456-7" />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Dirección</label>
            <input value={address} onChange={e => setAddress(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="Ej: Calle 123 #45-67" />
          </div>
        </div>

        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          Notificaciones del Sistema
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          A estos números de WhatsApp y correos electrónicos se enviarán los resúmenes diarios, alertas de vencimiento de clientes y recordatorios de cumpleaños. Si dejas el campo vacío, la función entrará en pausa.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Teléfonos */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', color: '#fff' }}>Teléfonos de Dueños (WhatsApp)</label>
                <button type="button" onClick={() => setPhones([...phones, '+57'])} style={{ background: 'none', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={16} /> Añadir Teléfono
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {phones.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      value={p} 
                      onChange={e => { const newP = [...phones]; newP[idx] = e.target.value; setPhones(newP); }}
                      placeholder="+57300..."
                      style={{ flex: 1, marginBottom: 0, padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} 
                    />
                    <button type="button" onClick={() => setPhones(phones.filter((_, i) => i !== idx))} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {phones.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No hay teléfonos configurados.</div>}
              </div>
            </div>

            {/* Correos */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', color: '#fff' }}>Correos de Dueños</label>
                <button type="button" onClick={() => setEmails([...emails, ''])} style={{ background: 'none', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={16} /> Añadir Correo
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {emails.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      type="email"
                      value={m} 
                      onChange={e => { const newM = [...emails]; newM[idx] = e.target.value; setEmails(newM); }}
                      placeholder="dueño@gimnasio.com"
                      style={{ flex: 1, marginBottom: 0, padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} 
                    />
                    <button type="button" onClick={() => setEmails(emails.filter((_, i) => i !== idx))} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {emails.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No hay correos configurados.</div>}
              </div>
            </div>

          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '2.5rem', width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Save size={20} /> Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
