require('dotenv').config();
const jwt = require('jsonwebtoken');

async function run() {
  try {
    const token = jwt.sign(
      { sub: 1, email: 'admin@gymflow.com', role: 'ADMIN' },
      process.env.JWT_SECRET || 'super-secret-gym-key',
      { expiresIn: '1h' }
    );
    
    const res = await fetch('http://localhost:3001/api/members', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    const m = data.find(x => x.cedula === '1126909356');
    console.log("JSON FROM API:");
    console.log(m);
  } catch(e) {
    console.error(e.message);
  }
}
run();
