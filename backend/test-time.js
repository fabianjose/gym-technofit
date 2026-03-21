const { execSync } = require('child_process');
try {
  const result = execSync('mysql -u root gymflow_db -e "SELECT id, full_name, registration_date, expiration_date FROM members WHERE cedula=\\"11111111\\" OR cedula=\\"123456\\";"');
  console.log(result.toString());
} catch (e) {
  console.log("No mysql cli", e.message);
}
