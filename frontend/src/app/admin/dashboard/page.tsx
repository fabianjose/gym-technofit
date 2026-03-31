"use client";
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AlertCircle, FileText, Smartphone } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ activeMembers: '--', machines: '--', notificationsToday: '--' });
  const [waStatus, setWaStatus] = useState({ connected: false });
  const [waLogs, setWaLogs] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchWa();
    fetchMembers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admins/dashboard', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setStats(res.data);
    } catch (e) {}
  };

  const fetchWa = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [statusRes, logsRes] = await Promise.all([
        axios.get('/api/whatsapp/status', { headers }),
        axios.get('/api/whatsapp/logs', { headers })
      ]);
      setWaStatus({ connected: statusRes.data.connected });
      setWaLogs(logsRes.data);
    } catch (e) {}
  };

  const fetchMembers = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get('/api/members', { headers });
      setMembers(res.data);
    } catch (e) {}
  };

  const expirations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = members.map((m: any) => {
      if (!m.expirationDate) return null;
      // Parsear fecha como local (sin corrimiento de zona horaria)
      const expStr = m.expirationDate.toString().substring(0, 10);
      const [year, month, day] = expStr.split('-').map(Number);
      const exp = new Date(year, month - 1, day);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      // Mostrar: vencidos (diffDays < 0) y próximos a vencer en 2 días o menos
      if (diffDays > 2) return null;
      return { ...m, diffDays, expDateStr: expStr };
    }).filter((m): m is NonNullable<typeof m> => m !== null);

    list.sort((a: any, b: any) => a.diffDays - b.diffDays);
    return list;
  }, [members]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Vencimientos Panel */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertCircle size={22} /> Próximos a Vencer y Vencidos
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            {expirations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>No hay usuarios próximos a vencer.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Cliente</th>
                    <th style={{ padding: '0.8rem' }}>Cédula</th>
                    <th style={{ padding: '0.8rem' }}>Vencimiento</th>
                    <th style={{ padding: '0.8rem' }}>Estado</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {expirations.map((m: any) => {
                    let badgeColor = '';
                    let badgeText = '';
                    let rowHighlight = 'transparent';

                    if (m.diffDays < 0) {
                      // Vencido
                      badgeColor = 'var(--danger)';
                      badgeText = `Vencido (hace ${Math.abs(m.diffDays)} día${Math.abs(m.diffDays) !== 1 ? 's' : ''})`;
                      rowHighlight = 'rgba(255,77,77,0.06)';
                    } else if (m.diffDays === 0) {
                      // Vence hoy
                      badgeColor = '#FF4500';
                      badgeText = '🔴 Vence HOY';
                      rowHighlight = 'rgba(255,69,0,0.08)';
                    } else if (m.diffDays === 1) {
                      // Vence mañana → Naranja
                      badgeColor = '#FF8C00';
                      badgeText = '🟠 Vence mañana';
                      rowHighlight = 'rgba(255,140,0,0.07)';
                    } else {
                      // 2 días antes → Amarillo
                      badgeColor = '#CCAA00';
                      badgeText = '🟡 Vence en 2 días';
                      rowHighlight = 'rgba(255,215,0,0.06)';
                    }

                    // Mostrar fecha sin desfase de zona horaria
                    const [y, mo, d] = m.expDateStr.split('-').map(Number);
                    const fechaVencimiento = `${d.toString().padStart(2,'0')}/${mo.toString().padStart(2,'0')}/${y}`;

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: rowHighlight }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 'bold', color: '#fff' }}>{m.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.whatsappNumber}</div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{m.cedula}</td>
                        <td style={{ padding: '1rem', color: badgeColor, fontWeight: 'bold' }}>
                          {fechaVencimiento}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '20px', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold', 
                            backgroundColor: `${badgeColor}22`,
                            color: badgeColor,
                            border: `1px solid ${badgeColor}`
                          }}>
                            {badgeText}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => router.push(`/admin/facturacion?memberId=${m.id}`)}
                            className="btn-primary" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            <FileText size={16} /> Cobrar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* WhatsApp Logs */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📝 Mensajes Enviados Recientemente</h3>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {waLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: '2rem' }}>No hay mensajes recientes.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {waLogs.map((log: any) => (
                  <li key={log.id} style={{ padding: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--primary-color)', fontSize: '0.85rem' }}>{log.member?.fullName || 'Sistema'}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.sentAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                        {log.messageBody?.substring(0, 60)}...
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: log.status === 'sent' ? 'rgba(0,210,138,0.2)' : 'rgba(255,77,77,0.2)', color: log.status === 'sent' ? 'var(--success)' : 'var(--danger)' }}>
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
