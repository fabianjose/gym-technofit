"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Send, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function MensajesMasivos() {
  const [members, setMembers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [results, setResults] = useState<{ sent: string[]; failed: string[] } | null>(null);
  const [selectedAll, setSelectedAll] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [membersRes, statusRes] = await Promise.all([
        axios.get('/api/members', { headers }),
        axios.get('/api/whatsapp/status', { headers }),
      ]);
      setMembers(membersRes.data.map((m: any) => ({ ...m, selected: true })));
      setWaConnected(statusRes.data.connected);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMember = (id: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const toggleAll = () => {
    const next = !selectedAll;
    setSelectedAll(next);
    setMembers(prev => prev.map(m => ({ ...m, selected: next })));
  };

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Escribe un mensaje antes de enviar.');
      return;
    }
    const targets = members.filter(m => m.selected && m.whatsappNumber);
    if (targets.length === 0) {
      alert('Selecciona al menos un miembro con número de WhatsApp.');
      return;
    }
    setSending(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const sent: string[] = [];
    const failed: string[] = [];

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const member of targets) {
      try {
        await axios.post('/api/whatsapp/send', {
          phone: member.whatsappNumber,
          message: message,
          memberId: member.id,
        }, { headers });
        sent.push(member.fullName);
      } catch {
        failed.push(member.fullName);
      }
      // Pausa de 2 segundos entre envíos para evitar bloqueo de WhatsApp
      await sleep(2000);
    }

    // If WhatsApp is not connected, simulate sending
    if (!waConnected) {
      setResults({
        sent: targets.map((m: any) => m.fullName),
        failed: [],
      });
      alert('⚠ WhatsApp no está conectado. Para envíos reales, conecta WhatsApp en el módulo correspondiente. Los envíos se simularon correctamente.');
    } else {
      setResults({ sent, failed });
    }

    setSending(false);
  };

  const selectedCount = members.filter(m => m.selected).length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '2rem' }}>
      <h2 className="title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '0.5rem' }}>Mensajes Masivos</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Envía un mensaje de WhatsApp a múltiples miembros a la vez (ofertas, recordatorios, avisos, etc.).</p>

      {/* Estado WhatsApp */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: waConnected ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
        <div>
          <strong style={{ color: waConnected ? 'var(--success)' : 'var(--danger)' }}>
            WhatsApp {waConnected ? 'Conectado ✅' : 'Desconectado ⚠'}
          </strong>
          {!waConnected && (
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Ve a <a href="/admin/whatsapp" style={{ color: 'var(--primary-color)' }}>Módulo WhatsApp</a> para conectar antes de enviar mensajes reales.
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Lista de Miembros */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              <Users size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Destinatarios ({selectedCount}/{members.length})
            </h3>
            <button onClick={toggleAll} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              {selectedAll ? 'Quitar todos' : 'Seleccionar todos'}
            </button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {members.map(m => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={m.selected}
                  onChange={() => toggleMember(m.id)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{m.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: m.whatsappNumber ? 'var(--text-muted)' : 'var(--danger)' }}>
                    {m.whatsappNumber || '⚠ Sin número'}
                  </div>
                </div>
              </label>
            ))}
            {members.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay miembros registrados.</p>
            )}
          </div>
        </div>

        {/* Composición del mensaje */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Escribe tu Mensaje</h3>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={8}
              placeholder="Hola 👋 Te informamos que tenemos una oferta especial esta semana en el gym..."
              style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {message.length} caracteres &bull; {selectedCount} destinatarios
              </span>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: (sending || !message.trim()) ? 0.6 : 1, cursor: (sending || !message.trim()) ? 'not-allowed' : 'pointer' }}
              >
                {sending ? '⏳ Enviando...' : <><Send size={18} /> Enviar a {selectedCount} miembros</>}
              </button>
            </div>
          </div>

          {results && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Resultado del Envío</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
                <CheckCircle size={18} />
                <span><strong>{results.sent.length}</strong> mensajes simulados/enviados</span>
              </div>
              {results.failed.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--danger)' }}>
                  <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span><strong>{results.failed.length}</strong> fallidos: {results.failed.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
