/**
 * Seed script: populates ALL modules with realistic test data
 * Prerequisites: backend running on https://gym.remotepcsolutions.com
 * Run with: node seed-data.js
 */

const https = require('https'); // ¡OJO! Cambiado a https

const BASE_URL = 'https://gym.remotepcsolutions.com';

// ---------- helpers ----------
function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'gym.remotepcsolutions.com', // Apuntando a tu servidor real
      port: 443,                             // Puerto de Cloudflare
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    
    // Cambiado de http.request a https.request
    const r = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

function log(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }

// ... de aquí en adelante tu función main() queda exactamente igual

// ---------- main ----------
async function main() {
  console.log('\n🔑 Autenticando...');
  const auth = await req('POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
  if (!auth.body.access_token) throw new Error('Login failed: ' + JSON.stringify(auth.body));
  const token = auth.body.access_token;
  log(`Logged in as admin`);

  // ─── 1. Payment Methods ────────────────────────────────────────────────
  console.log('\n💳 Payment Methods...');
  const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta de Crédito', 'Tarjeta de Débito'];
  const pmIds = [];
  for (const name of paymentMethods) {
    const r = await req('POST', '/api/payment-methods', { name, isActive: true }, token);
    if (r.status === 201 || r.status === 200) { log(name); pmIds.push(r.body); }
    else warn(`${name}: ${JSON.stringify(r.body)}`);
  }

  // ─── 2. Plans ────────────────────────────────────────────────────────
  console.log('\n📋 Plans...');
  const plansData = [
    { name: 'Plan Mensual', price: 35.00, durationDays: 30 },
    { name: 'Plan Trimestral', price: 95.00, durationDays: 90 },
    { name: 'Plan Semestral', price: 180.00, durationDays: 180 },
    { name: 'Plan Anual', price: 300.00, durationDays: 365 },
    { name: 'Plan Estudiante', price: 25.00, durationDays: 30 },
  ];
  const planIds = {};
  for (const p of plansData) {
    const r = await req('POST', '/api/plans', p, token);
    if (r.status === 201 || r.status === 200) { log(p.name); planIds[p.name] = r.body.id; }
    else warn(`${p.name}: ${JSON.stringify(r.body)}`);
  }

  // ─── 3. Discounts ────────────────────────────────────────────────────
  console.log('\n🏷 Discounts...');
  const discountsData = [
    { name: 'Descuento Estudiante', percentage: 15.00 },
    { name: 'Descuento Pareja', percentage: 10.00 },
    { name: 'Descuento Adulto Mayor', percentage: 20.00 },
    { name: 'Promo Referido', percentage: 5.00 },
  ];
  const discountIds = {};
  for (const d of discountsData) {
    const r = await req('POST', '/api/discounts', { ...d, isActive: true }, token);
    if (r.status === 201 || r.status === 200) { log(d.name); discountIds[d.name] = r.body.id; }
    else warn(`${d.name}: ${JSON.stringify(r.body)}`);
  }

  // ─── 4. Categories ────────────────────────────────────────────────────
  console.log('\n🏷 Categories (Machines)...');
  const categoriesData = [
    { name: 'Cardio', description: 'Equipos de entrenamiento cardiovascular' },
    { name: 'Fuerza', description: 'Equipos para entrenamiento de fuerza y musculación' },
    { name: 'Funcional', description: 'Equipos para entrenamiento funcional y core' },
    { name: 'Estiramientos', description: 'Equipos para flexibilidad y elongación' },
  ];
  for (const c of categoriesData) {
    const r = await req('POST', '/api/categories', c, token);
    if (r.status === 201 || r.status === 200) log(c.name);
    else warn(`${c.name}: ${JSON.stringify(r.body)}`);
  }

  // ─── 5. Machines ────────────────────────────────────────────────────
  console.log('\n🏋 Machines...');
  const machinesData = [
    { name: 'Cinta de Correr', description: 'Ideal para cardio y resistencia. Velocidad ajustable 1-20 km/h.', category: 'Cardio', showInPublic: true },
    { name: 'Bicicleta Estática', description: 'Entrenamiento de bajo impacto para piernas y cardio.', category: 'Cardio', showInPublic: true },
    { name: 'Elíptica', description: 'Movimiento de cuerpo completo sin impacto en las articulaciones.', category: 'Cardio', showInPublic: true },
    { name: 'Remo Indoor', description: 'Trabaja espalda, core y piernas simultáneamente.', category: 'Cardio', showInPublic: true },
    { name: 'Press de Banco', description: 'Banco ajustable con soporte para barra. Trabaja pecho y tríceps.', category: 'Fuerza', showInPublic: true },
    { name: 'Rack de Sentadillas', description: 'Sentadilla libre con jaula de seguridad y barra olímpica.', category: 'Fuerza', showInPublic: true },
    { name: 'Mancuernas (set completo)', description: 'Set de mancuernas de 2 a 50 kg.', category: 'Fuerza', showInPublic: true },
    { name: 'Polea Alta / Baja', description: 'Máquina de cable para múltiples ejercicios de jalón y remo.', category: 'Fuerza', showInPublic: true },
    { name: 'Prensa de Piernas', description: 'Para cuádriceps, isquiotibiales y glúteos.', category: 'Fuerza', showInPublic: true },
    { name: 'TRX', description: 'Entrenamiento en suspensión. Ideal para core y funcional.', category: 'Funcional', showInPublic: true },
    { name: 'Kettlebells', description: 'Pesas rusas de 4 a 32 kg para entrenamiento funcional.', category: 'Funcional', showInPublic: true },
    { name: 'Colchoneta / Yoga Mat', description: 'Para estiramientos, yoga y ejercicios en el piso.', category: 'Estiramientos', showInPublic: true },
  ];
  const machineIds = {};
  for (const m of machinesData) {
    const r = await req('POST', '/api/machines', m, token);
    if (r.status === 201 || r.status === 200) { log(m.name); machineIds[m.name] = r.body.id; }
    else warn(`${m.name}: ${JSON.stringify(r.body)}`);
  }

  // ─── 6. Members ──────────────────────────────────────────────────────
  console.log('\n👤 Members...');
  const today = new Date();
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().split('T')[0]; };
  const membersData = [
    { cedula: '0912345670', fullName: 'Carlos Andrade', email: 'carlos.andrade@email.com', whatsappNumber: '593991234560', birthDate: '1990-05-15', registrationDate: addDays(today, -60), expirationDate: addDays(today, 30), active: true, measurements: { weight: 78, height: 175, bmi: 25.5 } },
    { cedula: '1712345671', fullName: 'Sofía Ramírez', email: 'sofia.ramirez@email.com', whatsappNumber: '593991234561', birthDate: '1995-08-22', registrationDate: addDays(today, -45), expirationDate: addDays(today, 15), active: true, measurements: { weight: 62, height: 165, bmi: 22.8 } },
    { cedula: '0612345672', fullName: 'Diego Morales', email: 'diego.morales@email.com', whatsappNumber: '593991234562', birthDate: '1988-03-10', registrationDate: addDays(today, -90), expirationDate: addDays(today, -10), active: true, measurements: { weight: 85, height: 180, bmi: 26.2 } },
    { cedula: '1312345673', fullName: 'Valeria Castro', email: 'valeria.castro@email.com', whatsappNumber: '593991234563', birthDate: '2000-11-30', registrationDate: addDays(today, -30), expirationDate: addDays(today, 60), active: true, measurements: { weight: 55, height: 160, bmi: 21.5 } },
    { cedula: '0512345674', fullName: 'Roberto Ortega', email: 'roberto.ortega@email.com', whatsappNumber: '593991234564', birthDate: '1985-07-18', registrationDate: addDays(today, -120), expirationDate: addDays(today, -30), active: false, measurements: { weight: 92, height: 178, bmi: 29.0 } },
    { cedula: '1012345675', fullName: 'Camila Vega', email: 'camila.vega@email.com', whatsappNumber: '593991234565', birthDate: '1998-02-14', registrationDate: addDays(today, -15), expirationDate: addDays(today, 75), active: true, measurements: { weight: 58, height: 162, bmi: 22.1 } },
    { cedula: '0812345676', fullName: 'Andrés Paredes', email: 'andres.paredes@email.com', whatsappNumber: '593991234566', birthDate: '1992-09-05', registrationDate: addDays(today, -7), expirationDate: addDays(today, 23), active: true, measurements: { weight: 75, height: 172, bmi: 25.3 } },
  ];
  const memberIds = {};
  for (const m of membersData) {
    const r = await req('POST', '/api/members', m, token);
    if (r.status === 201 || r.status === 200) { log(m.fullName); memberIds[m.cedula] = r.body.id || r.body.cedula; }
    else warn(`${m.fullName}: ${JSON.stringify(r.body)}`);
  }

  // Fetch created members to get their real IDs
  const membersRes = await req('GET', '/api/members', null, token);
  const allMembers = Array.isArray(membersRes.body) ? membersRes.body : (membersRes.body.data || []);

  // ─── 7. Invoices ────────────────────────────────────────────────────
  console.log('\n🧾 Invoices...');
  // Get plans
  const plansRes = await req('GET', '/api/plans', null, token);
  const allPlans = Array.isArray(plansRes.body) ? plansRes.body : [];
  const mensualPlan = allPlans.find(p => p.name.includes('Mensual'));
  const trimestralPlan = allPlans.find(p => p.name.includes('Trimestral'));

  if (mensualPlan && allMembers.length > 0) {
    for (let i = 0; i < Math.min(allMembers.length, 5); i++) {
      const member = allMembers[i];
      const plan = i % 2 === 0 ? mensualPlan : (trimestralPlan || mensualPlan);
      const invoiceData = {
        memberId: member.id,
        planId: plan.id,
        amountTotal: plan.price,
        issueDate: addDays(today, -(i * 10)),
        paymentMethod: ['Efectivo', 'Transferencia', 'Tarjeta de Crédito'][i % 3],
        status: 'PAID',
      };
      const r = await req('POST', '/api/invoices', invoiceData, token);
      if (r.status === 201 || r.status === 200) log(`Factura para ${member.fullName}`);
      else warn(`Factura ${member.fullName}: ${JSON.stringify(r.body)}`);
    }
  }

  // ─── 8. Routines ────────────────────────────────────────────────────
  console.log('\n🏃 Routines...');
  const machinesRes = await req('GET', '/api/machines', null, token);
  const allMachines = Array.isArray(machinesRes.body) ? machinesRes.body : [];

  if (allMembers.length > 0 && allMachines.length >= 4) {
    const activeMembers = allMembers.filter(m => m.active).slice(0, 3);
    for (const member of activeMembers) {
      const routinePayload = {
        memberId: member.id,
        startDate: addDays(today, 0),
        cycleDays: 5,
        durationMonths: 2,
        skipSaturday: true,
        skipSunday: true,
        days: [
          {
            dayIndex: 0,
            dayLabel: 'Día A',
            notes: 'Pecho y Tríceps',
            exercises: [
              { machineId: allMachines[4]?.id, sets: 4, reps: '10-12', weight: '60kg', restSeconds: 90, orderIndex: 0 },
              { machineId: allMachines[6]?.id, sets: 3, reps: '12', weight: '15kg', restSeconds: 60, orderIndex: 1 },
              { machineId: allMachines[7]?.id, sets: 3, reps: '15', weight: '40kg', restSeconds: 60, orderIndex: 2 },
            ].filter(e => e.machineId),
          },
          {
            dayIndex: 1,
            dayLabel: 'Día B',
            notes: 'Piernas y Core',
            exercises: [
              { machineId: allMachines[5]?.id, sets: 4, reps: '8-10', weight: '80kg', restSeconds: 120, orderIndex: 0 },
              { machineId: allMachines[8]?.id, sets: 3, reps: '12', weight: '100kg', restSeconds: 90, orderIndex: 1 },
              { machineId: allMachines[10]?.id, sets: 3, reps: '20', weight: '20kg', restSeconds: 60, orderIndex: 2 },
            ].filter(e => e.machineId),
          },
          {
            dayIndex: 2,
            dayLabel: 'Día C',
            notes: 'Cardio y Espalda',
            exercises: [
              { machineId: allMachines[0]?.id, sets: 1, reps: '30 min', weight: '-', restSeconds: 0, orderIndex: 0, notes: '30 min a 8 km/h' },
              { machineId: allMachines[7]?.id, sets: 4, reps: '10', weight: '50kg', restSeconds: 90, orderIndex: 1 },
            ].filter(e => e.machineId),
          },
        ],
      };
      const r = await req('POST', `/api/routines/member/${member.id}`, routinePayload, token);
      if (r.status === 201 || r.status === 200) log(`Rutina para ${member.fullName}`);
      else warn(`Rutina ${member.fullName}: ${JSON.stringify(r.body)}`);
    }
  } else {
    warn('No hay suficientes miembros o máquinas para crear rutinas');
  }

  console.log('\n✅ ¡Seed completado exitosamente!\n');
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
