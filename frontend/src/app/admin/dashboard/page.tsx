"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ activeMembers: '--', machines: '--', notificationsToday: '--' });
  const [waStatus, setWaStatus] = useState({ connected: false, qr: '' });
  const [waLogs, setWaLogs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchWa();
    const i = setInterval(fetchWa, 5000);
    return () => clearInterval(i);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/admins/dashboard', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setStats(res.data);
    } catch (e) {}
  };

  const fetchWa = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [statusRes, logsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/whatsapp/status', { headers }),
        axios.get('http://localhost:3001/api/whatsapp/logs', { headers })
      ]);
      setWaStatus(statusRes.data);
      setWaLogs(logsRes.data);
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="title" style={{ textAlign: 'left', fontSize: '2rem' }}>Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Miembros Activos</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: '1rem 0' }}>{stats.activeMembers}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Máquinas</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--secondary-color)', margin: '1rem 0' }}>{stats.machines}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>WhatsApp Web</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: waStatus.connected ? 'var(--success)' : 'var(--danger)', margin: '1rem 0', textTransform: 'uppercase' }}>
            {waStatus.connected ? 'Conectado ✅' : 'Desconectado ❌'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* WhatsApp Connection Module */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📱 Módulo WhatsApp</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {waStatus.connected 
              ? 'El sistema está conectado y enviará los mensajes de rutina automáticamente a las horas configuradas.' 
              : 'Escanea el código QR con tu aplicación de WhatsApp (Dispositivos Vinculados) para autorizar los envíos.'}
          </p>
          
          {!waStatus.connected && waStatus.qr ? (
            <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
              <img src={waStatus.qr} alt="WhatsApp QR" style={{ width: '250px', height: '250px' }} />
            </div>
          ) : !waStatus.connected ? (
            <div style={{ width: '250px', height: '250px', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Generando QR...</span>
            </div>
          ) : (
            <div style={{ width: '250px', height: '250px', backgroundColor: 'rgba(0, 210, 138, 0.1)', border: '2px solid var(--success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</span>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Bot Activo</span>
            </div>
          )}

          {waStatus.connected && (
            <button 
              onClick={async () => {
                if (confirm('¿Seguro de desconectar WhatsApp? Tendrás que volver a escanear el código QR para autorizar los envíos.')) {
                  setWaStatus({ connected: false, qr: '' });
                  try {
                    await axios.post('http://localhost:3001/api/whatsapp/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  } catch (e) {}
                }
              }}
              style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', marginTop: '1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%', maxWidth: '250px' }}>
              Desconectar WhatsApp
            </button>
          )}
        </div>

        {/* WhatsApp Logs Module */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📝 Registro de Mensajes</h3>
          <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {waLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: '2rem' }}>No hay mensajes enviados recientemente.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {waLogs.map((log: any) => (
                  <li key={log.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--primary-color)' }}>{log.member?.fullName || `ID: ${log.memberId}`}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.sentAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                        {log.messageBody.substring(0, 50)}...
                      </span>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: log.status === 'sent' ? 'rgba(0, 210, 138, 0.2)' : 'rgba(255, 77, 77, 0.2)',
                        color: log.status === 'sent' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {log.status === 'sent' ? 'Enviado' : 'Falló'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
