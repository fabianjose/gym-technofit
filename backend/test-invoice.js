require('dotenv').config();
const jwt = require('jsonwebtoken');

async function run() {
  try {
    const token = jwt.sign(
      { sub: 1, email: 'admin@gymflow.com', role: 'ADMIN' },
      process.env.JWT_SECRET || 'super-secret-gym-key',
      { expiresIn: '1h' }
    );
    
    // Simulate creating invoice
    const res = await fetch('http://localhost:3001/api/invoices', {
      method: 'POST',
      headers: { 
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         memberId: 17, 
         planId: '9e590f90-a214-443a-a37f-6b0e58bfbfc5', 
         amountTotal: 50000
      })
    });
    
    if (!res.ok) {
       console.error("HTTP ERROR:", res.status);
       const txt = await res.text();
       console.error(txt);
    } else {
       console.log(await res.json());
    }
  } catch(e) {
    console.error(e.message);
  }
}
run();
