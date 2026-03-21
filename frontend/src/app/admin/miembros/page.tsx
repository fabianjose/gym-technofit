"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, X, Trash2, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function MiembrosPage() {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'medidas'
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ 
    cedula: '', 
    fullName: '', 
    email: '',
    whatsappNumber: '+57', 
    notifyTime: '07:00',
    birthDate: '',
    registrationDate: new Date().toISOString().split('T')[0],
    expirationDate: ''
  });

  const [measurements, setMeasurements] = useState({
    peso: '',
    altura: '',
    pecho: '',
    brazos: '',
    cintura: '',
    piernas: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: number | null, name: string }>({ open: false, id: null, name: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const res = await axios.get('http://localhost:3001/api/members', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setMembers(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const [hourStr, minuteStr] = form.notifyTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10) || 0;
    
    // Ensure +57 prefix if missing and non-empty
    let cleanedPhone = form.whatsappNumber;
    if (cleanedPhone && !cleanedPhone.startsWith('+57') && !cleanedPhone.startsWith('+')) {
      cleanedPhone = '+57' + cleanedPhone;
    }

    const data = { 
      ...form, 
      whatsappNumber: cleanedPhone,
      whatsappNotifyHour: hour, 
      whatsappNotifyMinute: minute,
      birthDate: form.birthDate || null,
      registrationDate: form.registrationDate || null,
      expirationDate: form.expirationDate || null,
      measurements
    };
    
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/members/${editingId}`, data, { headers });
        showSuccess('Miembro actualizado exitosamente');
      } else {
        await axios.post('http://localhost:3001/api/members', data, { headers });
        showSuccess('Miembro agregado exitosamente');
      }

      resetForm();
      fetchMembers();
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 409) {
        showError('Error al guardar. Es posible que la Cédula ya esté registrada o los datos sean inválidos.');
      } else {
        showError(err.response?.data?.message || 'Ocurrió un error inesperado al guardar.');
      }
      console.error(err);
    }
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    const h = m.whatsappNotifyHour ? m.whatsappNotifyHour.toString().padStart(2, '0') : '07';
    const min = m.whatsappNotifyMinute ? m.whatsappNotifyMinute.toString().padStart(2, '0') : '00';
    setForm({
      cedula: m.cedula,
      fullName: m.fullName,
      email: m.email || '',
      whatsappNumber: m.whatsappNumber || '+57',
      notifyTime: `${h}:${min}`,
      birthDate: m.birthDate ? m.birthDate.toString().substring(0, 10) : '',
      registrationDate: m.registrationDate ? m.registrationDate.toString().substring(0, 10) : new Date().toISOString().split('T')[0],
      expirationDate: m.expirationDate ? m.expirationDate.toString().substring(0, 10) : ''
    });
    setMeasurements({
      peso: m.measurements?.peso || '',
      altura: m.measurements?.altura || '',
      pecho: m.measurements?.pecho || '',
      brazos: m.measurements?.brazos || '',
      cintura: m.measurements?.cintura || '',
      piernas: m.measurements?.piernas || ''
    });
    setActiveTab('personal');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ cedula: '', fullName: '', email: '', whatsappNumber: '+57', notifyTime: '07:00', birthDate: '', registrationDate: new Date().toISOString().split('T')[0], expirationDate: '' });
    setMeasurements({ peso: '', altura: '', pecho: '', brazos: '', cintura: '', piernas: '' });
    setActiveTab('personal');
    setShowModal(false);
  };

  const confirmDelete = (m: any) => {
    setDeleteConfirm({ open: true, id: m.id, name: m.fullName });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/api/members/${deleteConfirm.id}`, { headers: { Authorization: `Bearer ${token}` } });
    showSuccess('Miembro eliminado exitosamente');
    setDeleteConfirm({ open: false, id: null, name: '' });
    fetchMembers();
  };

  return (
    <>
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--danger)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <X size={20} /> {errorMsg}
        </div>
      )}

      {deleteConfirm.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>⚠ Confirmar Eliminación</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>¿Seguro que deseas eliminar a <strong>{deleteConfirm.name}</strong>?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} className="btn-secondary">Cancelar</button>
              <button onClick={executeDelete} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
            <button onClick={resetForm} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>{editingId ? 'Editar Miembro' : 'Registro de Nuevo Miembro'}</h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <button onClick={() => setActiveTab('personal')} style={{ background: 'none', border: 'none', color: activeTab === 'personal' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'personal' ? 'bold' : 'normal', cursor: 'pointer', padding: '0.5rem' }}>Datos Personales</button>
              <button onClick={() => setActiveTab('medidas')} style={{ background: 'none', border: 'none', color: activeTab === 'medidas' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'medidas' ? 'bold' : 'normal', cursor: 'pointer', padding: '0.5rem' }}>Registro de Medidas</button>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === 'personal' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cédula *</label>
                    <input value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} required style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre Completo *</label>
                    <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} />
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Correo Electrónico</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ejemplo@correo.com" style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>WhatsApp *</label>
                    <input value={form.whatsappNumber} onChange={e => setForm({...form, whatsappNumber: e.target.value})} placeholder="+57300..." required style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} />
                  </div>


                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alerta de Whatsapp (Hora)</label>
                    <input type="time" value={form.notifyTime} onChange={e => setForm({...form, notifyTime: e.target.value})} style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha de Nacimiento</label>
                    <input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha de Inscripción *</label>
                    <input type="date" required value={form.registrationDate} onChange={e => setForm({...form, registrationDate: e.target.value})} style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', width: '100%' }} />
                  </div>

                </div>

              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Peso (kg)</label>
                    <input type="number" step="0.1" value={measurements.peso} onChange={e => setMeasurements({...measurements, peso: e.target.value})} style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} placeholder="Ej: 75.5" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Altura (cm)</label>
                    <input type="number" step="1" value={measurements.altura} onChange={e => setMeasurements({...measurements, altura: e.target.value})} style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} placeholder="Ej: 175" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pecho (cm)</label>
                    <input type="number" step="0.1" value={measurements.pecho} onChange={e => setMeasurements({...measurements, pecho: e.target.value})} style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} placeholder="Ej: 100" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brazos (cm)</label>
                    <input type="number" step="0.1" value={measurements.brazos} onChange={e => setMeasurements({...measurements, brazos: e.target.value})} style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} placeholder="Ej: 35" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cintura (cm)</label>
                    <input type="number" step="0.1" value={measurements.cintura} onChange={e => setMeasurements({...measurements, cintura: e.target.value})} style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} placeholder="Ej: 80" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Piernas (cm)</label>
                    <input type="number" step="0.1" value={measurements.piernas} onChange={e => setMeasurements({...measurements, piernas: e.target.value})} style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }} placeholder="Ej: 90" />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} /> {editingId ? 'Actualizar Miembro' : 'Completar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="title" style={{ margin: 0 }}>Gestión de Miembros</h2>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar por cédula o nombre..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '0.8rem', width: '300px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
          />
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}>
            <Plus size={20} /> Nuevo Miembro
          </button>
        </div>
      </div>

      <div className="card" style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cédula</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nombre Completo</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Contacto</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Inscripción</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Vencimiento</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.filter((m: any) => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || m.cedula.includes(searchQuery)).map((m: any) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem' }}>{m.cedula}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{m.fullName}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <div>{m.whatsappNumber}</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {m.registrationDate ? new Date(m.registrationDate).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {m.expirationDate ? new Date(m.expirationDate).toLocaleDateString() : 'Por Facturar'}
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <Link href={`/admin/rutinas/${m.id}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Ver Rutina</Link>
                  <button onClick={() => handleEdit(m)} className="btn-primary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }} title="Editar Datos Personales"><Edit2 size={16} /></button>
                  <button onClick={() => confirmDelete(m)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Eliminar Miembro"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay miembros registrados todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
