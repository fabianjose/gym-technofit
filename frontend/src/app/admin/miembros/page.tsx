"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, X, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MiembrosPage() {
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ cedula: '', fullName: '', whatsappNumber: '', notifyTime: '07:00' });
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
    const data = { ...form, whatsappNotifyHour: hour, whatsappNotifyMinute: minute };
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/members/${editingId}`, data, { headers });
        showSuccess('Miembro actualizado exitosamente');
      } else {
        await axios.post('http://localhost:3001/api/members', data, { headers });
        showSuccess('Miembro agregado exitosamente');
      }

      setForm({ cedula: '', fullName: '', whatsappNumber: '', notifyTime: '07:00' });
      setEditingId(null);
      fetchMembers();
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 409) {
        showError('Error al guardar. Es posible que la Cédula ya esté registrada.');
      } else {
        showError('Ocurrió un error inesperado al guardar.');
      }
    }
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    const h = m.whatsappNotifyHour ? m.whatsappNotifyHour.toString().padStart(2, '0') : '07';
    const min = m.whatsappNotifyMinute ? m.whatsappNotifyMinute.toString().padStart(2, '0') : '00';
    setForm({
      cedula: m.cedula,
      fullName: m.fullName,
      whatsappNumber: m.whatsappNumber || '',
      notifyTime: `${h}:${min}`
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ cedula: '', fullName: '', whatsappNumber: '', notifyTime: '07:00' });
  };

  const confirmDelete = (m: any) => {
    setDeleteConfirm({ open: true, id: m.id, name: m.fullName });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    await axios.delete(`http://localhost:3001/api/members/${deleteConfirm.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    showSuccess('Miembro eliminado exitosamente');
    setDeleteConfirm({ open: false, id: null, name: '' });
    fetchMembers();
  };

  return (
    <>
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0, 210, 138, 0.3)' }}>
          <CheckCircle size={20} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--danger)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(255, 77, 77, 0.3)' }}>
          <X size={20} />
          {errorMsg}
        </div>
      )}

      {deleteConfirm.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>⚠ Confirmar Eliminación</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              ¿Estás seguro que deseas eliminar a <strong>{deleteConfirm.name}</strong>?<br/>
              Esta acción no se puede deshacer y borrará también sus rutinas.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>Cancelar</button>
              <button onClick={executeDelete} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap-reverse' }}>
      <div className="card" style={{ flex: '1', minWidth: '350px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Miembros Registrados</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cédula</th>
              <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre</th>
              <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>WhatsApp</th>
              <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{m.cedula}</td>
                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{m.fullName}</td>
                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.whatsappNumber}<br/>({m.whatsappNotifyHour}:{m.whatsappNotifyMinute?.toString().padStart(2, '0') || '00'})</td>
                <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link href={`/admin/rutinas/${m.id}`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Rutina</Link>
                  <button onClick={() => handleEdit(m)} className="btn-primary" style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center' }} title="Editar Datos Personales"><Edit2 size={14} /></button>
                  <button onClick={() => confirmDelete(m)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Eliminar Miembro"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '350px', position: 'sticky', top: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, color: editingId ? 'var(--primary-color)' : '#fff' }}>
            {editingId ? 'Editar Miembro' : 'Nuevo Miembro'}
          </h3>
          {editingId && (
            <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex' }} title="Cancelar Edición">
              <X size={20} />
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cédula</label>
            <input value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} required style={{ marginBottom: 0 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
            <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required style={{ marginBottom: 0 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp (Ej: +57300...)</label>
            <input value={form.whatsappNumber} onChange={e => setForm({...form, whatsappNumber: e.target.value})} style={{ marginBottom: 0 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hora Notificación Whatsapp</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={form.notifyTime.split(':')[0]} onChange={e => setForm({...form, notifyTime: `${e.target.value}:${form.notifyTime.split(':')[1] || '00'}`})} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }}>
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')} hrs
                  </option>
                ))}
              </select>
              <select value={form.notifyTime.split(':')[1] || '00'} onChange={e => setForm({...form, notifyTime: `${form.notifyTime.split(':')[0] || '07'}:${e.target.value}`})} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }}>
                {[...Array(60)].map((_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')} min
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem' }}>
            {editingId ? 'Actualizar Miembro' : 'Guardar Miembro'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
