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
  const [logoBase64, setLogoBase64] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  
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
      setLogoBase64(res.data.logoBase64 || '');
      setReminderTime(res.data.reminderTime || '08:00');
      setSmtpHost(res.data.smtpHost || '');
      setSmtpPort(res.data.smtpPort || 465);
      setSmtpUser(res.data.smtpUser || '');
      setSmtpPass(res.data.smtpPass || '');
      setSmtpFrom(res.data.smtpFrom || '');
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
        address,
        logoBase64,
        reminderTime,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpFrom
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Logo del Gimnasio</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {logoBase64 && (
                <img src={logoBase64} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '8px', padding: '0.2rem' }} />
              )}
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setLogoBase64(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} style={{ padding: '0.5rem', flex: 1, color: '#fff' }} />
            </div>
          </div>
          
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
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          Notificaciones y WhatsApp
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Configura los números y correos autorizados para recibir resúmenes. El bot de WhatsApp enviará alertas de vencimiento.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>⏰ Hora de Ejecución de Tareas Programadas</label>
              <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '200px' }} />
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hora a la que se envían mensajes de feliz cumpleaños y cobranzas de WhatsApp.</p>
            </div>
            
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
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          Configuración SMTP (Envío de Correos)
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Ingresa las credenciales de tu proveedor de correo (Gmail, Outlook, SendGrid, etc.) para que GymFlow envíe felicitaciones a los miembros y copias de recibos.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Servidor SMTP (Host)</label>
            <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="Ej: smtp.gmail.com" />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Puerto</label>
            <input type="number" value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="465 o 587" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Correo Remitente (De:)</label>
            <input value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="Ej: Gimnasio <no-reply@mi-gimnasio.com>" />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Usuario SMTP / Correo</label>
            <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="Ej: gym@gmail.com" />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Contraseña de Aplicación</label>
            <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} style={{ padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', width: '100%', marginBottom: 0 }} placeholder="••••••••" />
          </div>
        </div>

      </div>
      
      {/* Botón Guardar Flotante */}
      <div style={{ marginTop: '2.5rem', position: 'sticky', bottom: '2rem', zIndex: 90 }}>
          <button onClick={handleSave} className="btn-primary" style={{ width: '100%', padding: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', boxShadow: '0 8px 16px rgba(119, 237, 101, 0.4)' }}>
            <Save size={24} /> Guardar Toda la Configuración
          </button>
      </div>
    </div>
  );
}
