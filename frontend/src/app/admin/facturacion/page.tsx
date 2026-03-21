"use client";
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import axios from 'axios';
import { CheckCircle, Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function FacturacionContent() {
  const searchParams = useSearchParams();
  const initialMemberId = searchParams.get('memberId');

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedDiscountId, setSelectedDiscountId] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [gymConfig, setGymConfig] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialMemberId && members.length > 0) {
      const mem: any = members.find((m: any) => m.id.toString() === initialMemberId);
      if (mem) {
        setSelectedMember(mem);
        setSearchQuery(mem.fullName);
      }
    }
  }, [initialMemberId, members]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [membersRes, plansRes, discountsRes, invoicesRes, configRes] = await Promise.all([
        axios.get('http://localhost:3001/api/members', { headers }),
        axios.get('http://localhost:3001/api/plans', { headers }),
        axios.get('http://localhost:3001/api/discounts/active', { headers }),
        axios.get('http://localhost:3001/api/invoices', { headers }),
        axios.get('http://localhost:3001/api/gym-config', { headers })
      ]);
      setMembers(membersRes.data);
      setPlans(plansRes.data);
      setDiscounts(discountsRes.data);
      setInvoices(invoicesRes.data);
      setGymConfig(configRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery || selectedMember) return [];
    const q = searchQuery.toLowerCase();
    return members.filter((m: any) => {
      const fn = m.fullName ? String(m.fullName).toLowerCase() : '';
      const cc = m.cedula ? String(m.cedula) : '';
      const wn = m.whatsappNumber ? String(m.whatsappNumber) : '';
      return fn.includes(q) || cc.includes(q) || wn.includes(q);
    }).slice(0, 6);
  }, [members, searchQuery, selectedMember]);

  const selectedPlan: any = plans.find((p: any) => p.id === selectedPlanId);
  const selectedDiscount: any = discounts.find((d: any) => d.id === selectedDiscountId);

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    let total = Number(selectedPlan.price);
    if (selectedDiscount) {
      total = total - (total * (Number(selectedDiscount.percentage) / 100));
    }
    return total;
  };

  const handleGenerateInvoice = async () => {
    if (!selectedMember || !selectedPlanId) {
      alert("Debes seleccionar un miembro y un plan.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/invoices', {
        memberId: selectedMember.id,
        planId: selectedPlanId,
        discountId: selectedDiscountId || undefined,
        amountTotal: calculateTotal()
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSuccessMsg('✅ Factura generada y membresía renovada exitosamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setSelectedMember(null);
      setSearchQuery('');
      setSelectedPlanId('');
      setSelectedDiscountId('');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error generando la factura.');
    }
  };

  const clearMember = () => {
    setSelectedMember(null);
    setSearchQuery('');
    setSelectedPlanId('');
    setSelectedDiscountId('');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      <h2 className="title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '1.5rem' }}>Facturación</h2>

      {/* ---- BUSCADOR ---- */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
          🔍 Buscar Cliente (nombre, cédula o teléfono)
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelectedMember(null); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Escribe para buscar al cliente..."
            style={{ width: '100%', paddingTop: '0.85rem', paddingBottom: '0.85rem', paddingLeft: '2.5rem', paddingRight: selectedMember ? '2.5rem' : '1rem', backgroundColor: 'var(--bg-color)', border: `1px solid ${selectedMember ? 'var(--success)' : 'var(--border-color)'}`, borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
          />
          {selectedMember && (
            <button onClick={clearMember} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          )}

          {searchFocused && filteredMembers.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
              {filteredMembers.map((m: any) => (
                <div
                  key={m.id}
                  onMouseDown={() => { setSelectedMember(m); setSearchQuery(m.fullName); }}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', flexShrink: 0 }}>
                    {(m.fullName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{m.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>C.C: {m.cedula} &nbsp;|&nbsp; {m.whatsappNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchFocused && searchQuery && !selectedMember && filteredMembers.length === 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', zIndex: 100, padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron clientes con ese criterio
            </div>
          )}
        </div>
      </div>

      {/* ---- TABLA DE FACTURA ESTILO EXCEL ---- */}
      <div className="card" style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📋 Detalle de la Factura</h3>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {gymConfig?.gymName || 'Gimnasio'} &mdash; NIT: {gymConfig?.nit || 'N/A'} &mdash; {gymConfig?.address || ''}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Cédula</th>
              <th style={thStyle}>WhatsApp</th>
              <th style={thStyle}>Vencimiento Actual</th>
              <th style={thStyle}>Plan Seleccionado</th>
              <th style={thStyle}>Descuento</th>
              <th style={thStyle}>Precio Base</th>
              <th style={thStyle}>Total a Cobrar</th>
            </tr>
          </thead>
          <tbody>
            {selectedMember ? (
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{selectedMember.fullName}</div>
                </td>
                <td style={tdStyle}>{selectedMember.cedula}</td>
                <td style={tdStyle}>{selectedMember.whatsappNumber}</td>
                <td style={tdStyle}>
                  <span style={{ color: selectedMember.expirationDate ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {selectedMember.expirationDate ? new Date(selectedMember.expirationDate).toLocaleDateString() : 'Sin facturar'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <select
                    value={selectedPlanId}
                    onChange={e => setSelectedPlanId(e.target.value)}
                    style={{ padding: '0.5rem', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', width: '100%' }}
                  >
                    <option value="">-- Elegir plan --</option>
                    {plans.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <select
                    value={selectedDiscountId}
                    onChange={e => setSelectedDiscountId(e.target.value)}
                    style={{ padding: '0.5rem', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', width: '100%' }}
                  >
                    <option value="">-- Sin descuento --</option>
                    {discounts.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.percentage}%)</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  {selectedPlan ? `$${Number(selectedPlan.price).toLocaleString()} COP` : '—'}
                </td>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                  {selectedPlan ? `$${calculateTotal().toLocaleString()} COP` : '—'}
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Busca y selecciona un cliente para crear la factura
                </td>
              </tr>
            )}
          </tbody>
          {selectedMember && selectedPlan && (
            <tfoot>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderTop: '2px solid var(--border-color)' }}>
                <td colSpan={6} style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {selectedDiscount && <span>Descuento aplicado: -{selectedDiscount.percentage}%</span>}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>TOTAL</td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.3rem' }}>
                  ${calculateTotal().toLocaleString()} COP
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {selectedMember && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleGenerateInvoice}
              disabled={!selectedPlanId}
              className="btn-primary"
              style={{ padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: !selectedPlanId ? 0.5 : 1, cursor: !selectedPlanId ? 'not-allowed' : 'pointer' }}
            >
              <CheckCircle size={20} /> Emitir Factura
            </button>
          </div>
        )}
      </div>

      {/* ---- HISTORIAL ESTILO TABLA ---- */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>📄 Historial de Facturas</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Plan</th>
                <th style={thStyle}>Descuento</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aún no se han emitido facturas.</td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>#{inv.invoiceNumber}</span>
                    </td>
                    <td style={tdStyle}><span style={{ fontWeight: 'bold' }}>{inv.member?.fullName || '—'}</span></td>
                    <td style={tdStyle}>{inv.plan?.name || '—'}</td>
                    <td style={tdStyle}>{inv.discount ? `${inv.discount.name} (${inv.discount.percentage}%)` : '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: 'var(--primary-color)' }}>${Number(inv.amountTotal).toLocaleString()} COP</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.8rem 1rem',
  textAlign: 'left',
  color: 'var(--text-muted)',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  verticalAlign: 'middle',
  fontSize: '0.9rem',
};

export default function FacturacionPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Cargando datos...</div>}>
      <FacturacionContent />
    </Suspense>
  );
}
