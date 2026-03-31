"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RutinaBuilder({ params }: { params: { memberId: string } }) {
  const [member, setMember] = useState<any>(null);
  const [machines, setMachines] = useState<any[]>([]);
  const d = new Date();
  const todayLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [template, setTemplate] = useState<any>({ cycleDays: 5, durationMonths: 2, skipSaturday: false, skipSunday: true, startDate: todayLocal, days: [] });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [params.memberId]);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const [memRes, machRes] = await Promise.all([
        axios.get(`/api/members/${params.memberId}`, { headers }),
        axios.get('/api/machines', { headers })
      ]);
      setMember(memRes.data);
      setMachines(machRes.data);
      
      try {
        const tplRes = await axios.get(`/api/routines/member/${params.memberId}`, { headers });
        if (tplRes.data) {
          setTemplate({ ...tplRes.data, skipSaturday: tplRes.data.skipSaturday ?? false, skipSunday: tplRes.data.skipSunday ?? true });
        }
      } catch (e) {
        // No active template
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDay = () => {
    const newDay = { dayIndex: template.days?.length || 0, dayLabel: `Día ${(template.days?.length || 0) + 1}`, notes: '', exercises: [] };
    setTemplate({ ...template, days: [...(template.days || []), newDay] });
  };

  const handleAddExercise = (dayIndex: number) => {
    const newDays = [...template.days];
    newDays[dayIndex].exercises.push({ machineId: machines[0]?.id || 0, sets: 4, reps: '10-12', weight: '', restSeconds: 60, orderIndex: newDays[dayIndex].exercises.length });
    setTemplate({ ...template, days: newDays });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = { ...template, cycleDays: template.days?.length || 0 };
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      if (template.id) {
        await axios.put(`/api/routines/template/${template.id}`, payload, { headers });
      } else {
        await axios.post(`/api/routines/member/${params.memberId}`, payload, { headers });
      }
      alert('Rutina guardada exitosamente.');
      router.push('/admin/miembros');
    } catch (err) {
      alert('Error guardando rutina');
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="title" style={{ margin: 0, fontSize: '1.8rem' }}>Rutina: {member.fullName}</h2>
        <button 
          onClick={handleSave} 
          className="btn-primary" 
          disabled={isSaving}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : '💾'} {isSaving ? 'Guardando...' : 'Guardar Calendario'}
        </button>
      </div>
      
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha Inicio</label>
          <input type="date" value={template.startDate?.split('T')[0] || ''} onChange={e => setTemplate({...template, startDate: e.target.value})} style={{ marginBottom: 0, padding: '0.5rem', colorScheme: 'dark' }} />
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Días/Ciclo</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontWeight: 'bold' }}>
            {template.days?.length || 0}
          </div>
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duración (Meses)</label>
          <input type="number" value={template.durationMonths} onChange={e => setTemplate({...template, durationMonths: +e.target.value})} style={{ marginBottom: 0, padding: '0.5rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="skipSat" checked={template.skipSaturday} onChange={e => setTemplate({...template, skipSaturday: e.target.checked})} style={{ width: 'auto', marginBottom: 0, transform: 'scale(1.5)' }} />
            <label htmlFor="skipSat" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Excluir Sábado</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="skipSun" checked={template.skipSunday} onChange={e => setTemplate({...template, skipSunday: e.target.checked})} style={{ width: 'auto', marginBottom: 0, transform: 'scale(1.5)' }} />
            <label htmlFor="skipSun" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Excluir Domingo</label>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
        {template.days?.map((day: any, dIndex: number) => (
          <div key={dIndex} className="card" style={{ padding: '0.75rem', borderTop: '4px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '60px', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--primary-color)' }}>
                Día {dIndex + 1}
              </div>
              <input value={day.notes} onChange={e => {
                const newDays = [...template.days]; newDays[dIndex].notes = e.target.value; setTemplate({...template, days: newDays});
              }} placeholder="Notas del día (Ej: Descanso)" style={{ flex: 1, padding: '0.25rem 0.5rem', marginBottom: 0, fontSize: '0.85rem' }} />
              <button onClick={() => {
                const newDays = template.days.filter((_:any, i:number) => i !== dIndex); setTemplate({...template, days: newDays});
              }} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: '0.25rem' }} title="Eliminar Día">✖</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {day.exercises?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', padding: '0 0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  <div style={{ flex: 1 }}>Máquina / Ejercicio</div>
                  <div style={{ width: '45px', textAlign: 'center' }}>Ser.</div>
                  <div style={{ width: '55px', textAlign: 'center' }}>Reps</div>
                  <div style={{ width: '55px', textAlign: 'center' }}>Desc(s)</div>
                  <div style={{ width: '24px' }}></div>
                </div>
              )}
              {day.exercises?.map((ex: any, eIndex: number) => (
                <div key={eIndex} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '0.25rem', borderRadius: '4px' }}>
                  <select value={ex.machineId || ''} onChange={e => {
                    const newDays = [...template.days]; newDays[dIndex].exercises[eIndex].machineId = +e.target.value; setTemplate({...template, days: newDays});
                  }} style={{ flex: 1, marginBottom: 0, padding: '0.25rem', fontSize: '0.85rem' }}>
                    {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="number" title="Series" placeholder="Ser." value={ex.sets} onChange={e => {
                    const newDays = [...template.days]; newDays[dIndex].exercises[eIndex].sets = +e.target.value; setTemplate({...template, days: newDays});
                  }} style={{ width: '45px', marginBottom: 0, padding: '0.25rem', fontSize: '0.85rem', textAlign: 'center' }} />
                  <input title="Repeticiones" placeholder="Reps." value={ex.reps} onChange={e => {
                    const newDays = [...template.days]; newDays[dIndex].exercises[eIndex].reps = e.target.value; setTemplate({...template, days: newDays});
                  }} style={{ width: '55px', marginBottom: 0, padding: '0.25rem', fontSize: '0.85rem', textAlign: 'center' }} />
                  <input title="Descanso en segundos" placeholder="Desc. (s)" value={ex.restSeconds} onChange={e => {
                    const newDays = [...template.days]; newDays[dIndex].exercises[eIndex].restSeconds = e.target.value; setTemplate({...template, days: newDays});
                  }} style={{ width: '55px', marginBottom: 0, padding: '0.25rem', fontSize: '0.85rem', textAlign: 'center' }} />
                  <button onClick={() => {
                    const newDays = [...template.days]; newDays[dIndex].exercises = newDays[dIndex].exercises.filter((_:any, i:number) => i !== eIndex); setTemplate({...template, days: newDays});
                  }} style={{ color: 'var(--danger)', fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer', width: '24px' }}>✖</button>
                </div>
              ))}
            </div>
            <button onClick={() => handleAddExercise(dIndex)} style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary-color)', background: 'none', border: '1px solid var(--primary-color)', borderRadius: '16px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start' }}>+ Ejercicio</button>
          </div>
        ))}
        <div className="card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', background: 'transparent', cursor: 'pointer', borderRadius: '8px' }} onClick={handleAddDay}>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>+ Añadir Día</span>
        </div>
      </div>
    </div>
  );
}
