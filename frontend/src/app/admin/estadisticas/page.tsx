"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart2, DollarSign, CreditCard, Users, TrendingUp } from 'lucide-react';

export default function EstadisticasPage() {
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (from) params.from = from;
      if (to)   params.to = to;
      const res = await axios.get('/api/invoices/stats', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setStats(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const maxBar = (arr: any[]) => Math.max(...arr.map((i: any) => i.total), 1);

  const cardStyle: React.CSSProperties = {
    background: 'var(--panel-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.5rem',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h2 className="title" style={{ textAlign: 'left', fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <BarChart2 size={28} /> Estadísticas de Pagos
      </h2>

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, var(--panel-bg) 0%, rgba(255,255,255,0.05) 100%)' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rango de Inicio</span>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '0.7rem 1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rango de Fin</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '0.7rem 1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setFrom(''); setTo(''); setTimeout(fetchStats, 50); }} style={{ padding: '0.7rem 1.2rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' }}>
            Limpiar
          </button>
          <button onClick={fetchStats} className="btn-primary" style={{ padding: '0.7rem 2rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderRadius: '10px', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)' }} disabled={loading}>
            {loading ? 'Consultando...' : <><TrendingUp size={18} /> Filtrar Datos</>}
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            <div style={{ ...cardStyle, borderLeft: '4px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <DollarSign size={16} /> Total Recaudado
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                ${Number(stats.totalRevenue).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>COP</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid var(--success, #10b981)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <BarChart2 size={16} /> Facturas Pagadas
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {stats.totalInvoices}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>transacciones</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <CreditCard size={16} /> Ticket Promedio
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                ${stats.totalInvoices > 0 ? Number(stats.totalRevenue / stats.totalInvoices).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>COP por factura</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Por Método de Pago */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} /> Por Método de Pago
              </h3>
              {stats.byMethod.map((m: any) => (
                <div key={m.name} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#fff' }}>{m.name}</span>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>${Number(m.total).toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'var(--bg-color)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--primary-color)', height: '100%', width: `${(m.total / maxBar(stats.byMethod)) * 100}%`, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.count} facturas</div>
                </div>
              ))}
              {stats.byMethod.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Sin datos en este rango.</p>}
            </div>

            {/* Top Usuarios */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} /> Top 10 Usuarios por Pago
              </h3>
              {stats.byMember.map((m: any, i: number) => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: i < 3 ? '#000' : 'var(--text-muted)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.count} pago{m.count !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-color)', flexShrink: 0 }}>
                    ${Number(m.total).toLocaleString()}
                  </div>
                </div>
              ))}
              {stats.byMember.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Sin datos en este rango.</p>}
            </div>
          </div>

          {/* Ingreso Mensual */}
          {stats.monthly.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} /> Ingresos Mensuales
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', height: '160px', padding: '0 0.5rem' }}>
                {stats.monthly.map((m: any) => {
                  const pct = (m.total / maxBar(stats.monthly)) * 100;
                  const [yr, mo] = m.month.split('-');
                  const label = new Date(Number(yr), Number(mo) - 1).toLocaleString('es', { month: 'short', year: '2-digit' });
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>${Number(m.total).toLocaleString()}</div>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '120px' }}>
                        <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(to top, var(--primary-color), #34d399)', borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.5s ease' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
