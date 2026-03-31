"use client";
import { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Download } from 'lucide-react';

// Expected CSV columns (in order):
// cedula, fullName, email, whatsappNumber, birthDate (YYYY-MM-DD), registrationDate (YYYY-MM-DD)

export default function CargaMasiva() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];
    // Skip header row if it starts with text (not a number)
    const startIdx = isNaN(Number(lines[0].split(',')[0].trim())) ? 1 : 0;
    return lines.slice(startIdx).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return {
        cedula: cols[0] || '',
        fullName: cols[1] || '',
        email: cols[2] || '',
        whatsappNumber: cols[3] || '',
        birthDate: cols[4] || '',
        registrationDate: cols[5] || new Date().toISOString().split('T')[0],
        expirationDate: cols[6] || '',
      };
    }).filter(r => r.cedula && r.fullName);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setPreview(parsed.slice(0, 5)); // show first 5 rows as preview
    };
    reader.readAsText(f, 'UTF-8');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      let successCount = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          await axios.post('/api/members', {
            ...row,
            whatsappNumber: row.whatsappNumber || '+57',
            whatsappNotifyHour: 7,
            whatsappNotifyMinute: 0,
            birthDate: row.birthDate || null,
            registrationDate: row.registrationDate || null,
            expirationDate: row.expirationDate || null,
          }, { headers });
          successCount++;
        } catch (err: any) {
          errors.push(`${row.cedula} - ${row.fullName}: ${err.response?.data?.message || 'Error desconocido'}`);
        }
      }

      setResults({ success: successCount, errors });
      setLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const downloadTemplate = () => {
    const csv = 'cedula,fullName,email,whatsappNumber,birthDate,registrationDate,expirationDate\n12345678,Juan Perez,juan@email.com,+573001234567,1990-05-15,2026-03-20,2026-04-20\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_miembros.csv';
    a.click();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2rem' }}>
      <h2 className="title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '0.5rem' }}>Carga Masiva de Miembros</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Importa múltiples miembros a la vez desde un archivo CSV.</p>

      {/* Plantilla */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>1. Descarga la Plantilla</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          El CSV debe tener las columnas en este orden: <code style={{ backgroundColor: 'var(--bg-color)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>cedula, fullName, email, whatsappNumber, birthDate (YYYY-MM-DD), registrationDate (YYYY-MM-DD), expirationDate (YYYY-MM-DD)</code>
        </p>
        <button onClick={downloadTemplate} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> Descargar Plantilla CSV
        </button>
      </div>

      {/* Carga */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>2. Selecciona tu Archivo CSV</h3>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
          <Upload size={40} color="var(--primary-color)" />
          <span style={{ color: 'var(--text-muted)' }}>{file ? file.name : 'Haz clic para seleccionar un archivo .csv'}</span>
          <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        {preview.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Vista Previa (primeras 5 filas):</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Cédula', 'Nombre', 'Email', 'WhatsApp', 'Nacimiento', 'Inscripción'].map(h => (
                      <th key={h} style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.5rem' }}>{row.cedula}</td>
                      <td style={{ padding: '0.5rem' }}>{row.fullName}</td>
                      <td style={{ padding: '0.5rem' }}>{row.email}</td>
                      <td style={{ padding: '0.5rem' }}>{row.whatsappNumber}</td>
                      <td style={{ padding: '0.5rem' }}>{row.birthDate}</td>
                      <td style={{ padding: '0.5rem' }}>{row.registrationDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Acción */}
      {file && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>3. Importar</h3>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '⏳ Importando...' : <><Upload size={18} /> Importar Miembros</>}
          </button>
        </div>
      )}

      {/* Resultados */}
      {results && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Resultado de la Importación</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--success)' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{results.success} miembros importados exitosamente.</span>
          </div>
          {results.errors.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--danger)' }}>
                <AlertCircle size={18} />
                <span style={{ fontWeight: 'bold' }}>{results.errors.length} errores:</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {results.errors.map((e, i) => (
                  <li key={i} style={{ padding: '0.4rem 0', color: 'var(--danger)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                    ⚠ {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
