"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function WhatsAppPage() {
  const [waStatus, setWaStatus] = useState({ connected: false, qr: '' });
  const [waLogs, setWaLogs] = useState([]);

  useEffect(() => {
    fetchWa();
    const i = setInterval(fetchWa, 5000);
    return () => clearInterval(i);
  }, []);

  const fetchWa = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [statusRes, logsRes] = await Promise.all([
        axios.get('/api/whatsapp/status', { headers }),
        axios.get('/api/whatsapp/logs', { headers })
      ]);
      setWaStatus(statusRes.data);
      setWaLogs(logsRes.data);
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <h2 className="title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '1.5rem' }}>Servidor de WhatsApp</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📱 Conexión WhatsApp</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {waStatus.connected 
              ? 'El sistema está conectado y enviará los mensajes automáticamente.' 
              : 'Escanea el código QR para autorizar los envíos de Rutinas y Alertas.'}
          </p>
          
          {!waStatus.connected && waStatus.qr ? (
            <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
              <Image src={waStatus.qr} alt="WhatsApp QR" width={250} height={250} unoptimized />
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
                if (confirm('¿Seguro de desconectar WhatsApp?')) {
                  setWaStatus({ connected: false, qr: '' });
                  try {
                    await axios.post('/api/whatsapp/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  } catch (e) {}
                }
              }}
              style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', marginTop: '1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', maxWidth: '250px' }}>
              Desconectar WhatsApp
            </button>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📝 Logs de WhatsApp</h3>
          <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {waLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: '2rem' }}>No hay mensajes recientes.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {waLogs.map((log: any) => (
                  <li key={log.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{log.member?.fullName || `Sistema`}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                        {log.messageBody.substring(0, 45)}...
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: log.status === 'sent' ? 'rgba(0, 210, 138, 0.2)' : 'rgba(255, 77, 77, 0.2)', color: log.status === 'sent' ? 'var(--success)' : 'var(--danger)' }}>
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
