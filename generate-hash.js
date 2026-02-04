const bcrypt = require('bcryptjs');

const password = 'luisa2026?@';

bcrypt.hash(password, 10).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nCopia este JSON para MongoDB Compass:\n');
  console.log(JSON.stringify({
    username: "luisaramirez",
    password: hash,
    nombre: "Luisa Ramírez",
    rol: "admin",
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }, null, 2));
});
