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

  // Invoice on signup
  const [emitInvoice, setEmitInvoice] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoiceForm, setInvoiceForm] = useState({ planId: '', discountId: '', paymentMethod: 'Efectivo', amountTotal: '' });
  
  const [form, setForm] = useState({ 
    cedula: '', 
    fullName: '', 
    email: '',
    whatsappNumber: '+57', 
    notifyTime: '07:00',
    birthDate: '',
    registrationDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    defaultPlanId: '',
    defaultDiscountId: '',
    address: '',
    rh: '',
    emergencyContact: '',
    observations: '',
    active: true
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
    fetchCatalogues();
  }, []);

  const fetchCatalogues = async () => {
    try {
      const token = localStorage.getItem('token');
      const [plansRes, discountsRes, pmRes] = await Promise.all([
        axios.get('/api/plans'),
        axios.get('/api/discounts'),
        axios.get('/api/payment-methods', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPlans(plansRes.data);
      setDiscounts(discountsRes.data.filter((d: any) => d.isActive));
      setPaymentMethods(pmRes.data.filter((p: any) => p.isActive));
    } catch (e) {
      console.error('Error loading catalogues', e);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/api/members', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('--- RECIBIDO DE BACKEND ---');
      console.log('Lista cruda (primer elemento si existe):', response.data[0]);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
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
      // expirationDate la calcula el backend desde registrationDate
      expirationDate: undefined,
      address: form.address || null,
      rh: form.rh || null,
      emergencyContact: form.emergencyContact || null,
      observations: form.observations || null,
      active: form.active,
      measurements
    };
    
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    try {
      console.log('--- ENVIANDO A BACKEND ---');
      console.log('Payload de fechas:', { birthDate: data.birthDate, registrationDate: data.registrationDate });
      
      if (editingId) {
        await axios.put(`/api/members/${editingId}`, data, { headers });
        showSuccess('Miembro actualizado exitosamente');
      } else {
        const created = await axios.post('/api/members', data, { headers });
        // Emit first invoice if requested
        if (emitInvoice && form.defaultPlanId) {
          const plan = plans.find((p: any) => p.id === form.defaultPlanId);
          const disc = form.defaultDiscountId ? discounts.find((d: any) => d.id === form.defaultDiscountId) : null;
          const basePrice = plan ? Number(plan.price) : 0;
          const finalPrice = disc ? basePrice * (1 - disc.percentage / 100) : basePrice;

          await axios.post('/api/invoices', {
            memberId: created.data.id,
            planId: form.defaultPlanId,
            discountId: form.defaultDiscountId || undefined,
            amountTotal: Math.round(finalPrice),
            paymentMethod: invoiceForm.paymentMethod,
          }, { headers });
          showSuccess('¡Miembro registrado y primera factura emitida!');
        } else if (emitInvoice && !form.defaultPlanId) {
           showError('Se guardó el miembro, pero para emitir factura debiste seleccionar un Plan Predeterminado.');
        } else {
          showSuccess('Miembro agregado exitosamente');
        }
      }

      resetForm();
      fetchMembers();
    } catch (err: any) {
      const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error desconocido';
      const status = err.response?.status;
      if (status === 409 || (typeof backendMsg === 'string' && backendMsg.toLowerCase().includes('duplicate'))) {
        showError('La Cédula ya está registrada en otro miembro.');
      } else {
        showError(`Error ${status || ''}: ${Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg}`);
      }
      console.error('Update error:', err.response?.data, err);
    }
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    const h = m.whatsappNotifyHour ? m.whatsappNotifyHour.toString().padStart(2, '0') : '07';
    const min = m.whatsappNotifyMinute ? m.whatsappNotifyMinute.toString().padStart(2, '0') : '00';
    
    // Función para extraer el YYYY-MM-DD sin pasar por Date() para evitar desfase de zona horaria
    const extractDateStr = (dateVal: any) => {
      if (!dateVal) return '';
      const s = dateVal.toString();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
      const match = s.match(/(\d{4}-\d{2}-\d{2})/);
      return match ? match[1] : '';
    };

    setForm({
      cedula: m.cedula,
      fullName: m.fullName,
      email: m.email || '',
      whatsappNumber: m.whatsappNumber || '+57',
      notifyTime: `${h}:${min}`,
      birthDate: extractDateStr(m.birthDate),
      registrationDate: extractDateStr(m.registrationDate) || new Date().toISOString().split('T')[0],
      expirationDate: extractDateStr(m.expirationDate),
      defaultPlanId: m.defaultPlanId?.toString() || '',
      defaultDiscountId: m.defaultDiscountId?.toString() || '',
      address: m.address || '',
      rh: m.rh || '',
      emergencyContact: m.emergencyContact || '',
      observations: m.observations || '',
      active: m.active ?? true
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
    setEmitInvoice(false);
    setInvoiceForm({ planId: '', discountId: '', paymentMethod: 'Efectivo', amountTotal: '' });
    setForm({ cedula: '', fullName: '', email: '', whatsappNumber: '+57', notifyTime: '07:00', birthDate: '', registrationDate: new Date().toISOString().split('T')[0], expirationDate: '', defaultPlanId: '', defaultDiscountId: '', address: '', rh: '', emergencyContact: '', observations: '', active: true });
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
    await axios.delete(`/api/members/${deleteConfirm.id}`, { headers: { Authorization: `Bearer ${token}` } });
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
                    <div style={{ display: 'flex' }}>
                      <span style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--text-muted)' }}>+57</span>
                      <input 
                        value={form.whatsappNumber.replace(/^\+57/, '').replace(/^\+/, '')} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^\d]/g, '');
                          setForm({...form, whatsappNumber: '+57' + val});
                        }} 
                        placeholder="3001234567" 
                        required 
                        style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '0 8px 8px 0', border: '1px solid var(--border-color)', color: '#fff' }} 
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                    <input type="checkbox" id="activeMember" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer', margin: 0 }} />
                    <label htmlFor="activeMember" style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', color: form.active ? 'var(--primary-color)' : 'var(--danger)' }}>
                      {form.active ? 'Membresía Activa (Recibe alertas)' : 'Inactivo (No notificar, ni enviar masivos)'}
                    </label>
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

                  <div style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>Información Adicional (Opcional)</label>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dirección</label>
                    <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Ej: Calle 123 #45-67..." style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tipo de Sangre (RH)</label>
                    <input value={form.rh} onChange={e => setForm({...form, rh: e.target.value})} placeholder="Ej: O+" maxLength={10} style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', width: '100%' }} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contacto de Emergencia</label>
                    <input value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} placeholder="Ej: Esposa - María Lopez 3001234567" style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', width: '100%' }} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Observaciones Generales</label>
                    <textarea value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} rows={2} placeholder="Condiciones médicas, lesiones, notas administrativas..." style={{ marginBottom: 0, padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff', width: '100%', resize: 'vertical' }} />
                  </div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>Suscripción Financiera Predeterminada</label>
                  </div>

                  <div>
                     <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Plan Predeterminado</label>
                     <select 
                        value={form.defaultPlanId} 
                        onChange={e => setForm({...form, defaultPlanId: e.target.value})}
                        style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }}
                     >
                        <option value="">— Sin plan asignado —</option>
                        {plans.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Descuento Predeterminado</label>
                     <select 
                        value={form.defaultDiscountId} 
                        onChange={e => setForm({...form, defaultDiscountId: e.target.value})}
                        style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }}
                     >
                        <option value="">— Sin descuento —</option>
                        {discounts.map((d: any) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.percentage}%)</option>
                        ))}
                     </select>
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

              {/* INVOICE ON SIGNUP - only for new members */}
              {!editingId && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={emitInvoice}
                      onChange={e => setEmitInvoice(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                    />
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1rem' }}>
                      💳 Emitir primera factura de ingreso
                    </span>
                  </label>

                  {emitInvoice && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                         La factura se va a emitir utilizando el <strong>Plan y Descuento Predeterminados</strong> seleccionados en la sección de arriba. Si no has seleccionado ningún plan arriba, la factura no procederá.
                      </p>
                      <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Método de Pago *</label>
                        <select
                          value={invoiceForm.paymentMethod}
                          onChange={e => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })}
                          style={{ marginBottom: 0, width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#fff' }}
                        >
                          {paymentMethods.map((pm: any) => (
                            <option key={pm.id} value={pm.name}>{pm.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} /> {editingId ? 'Actualizar Miembro' : (emitInvoice ? '✅ Registrar y Facturar' : 'Completar Registro')}
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
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                  {m.fullName}
                  {m.active === false && <span style={{ marginLeft: '0.5rem', backgroundColor: 'var(--danger)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>INACTIVO</span>}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <div>{m.whatsappNumber}</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {m.registrationDate?.toString().substring(0,10).split('-').reverse().join('/') || 'N/A'}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {m.expirationDate?.toString().substring(0,10).split('-').reverse().join('/') || 'Por Facturar'}
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
