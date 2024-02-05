// app.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');  // Agrega Authorization si es necesario
  next();
});
// Manejar el monto total de propinas
let totalTips = 0;

// Ruta para capturar propinas
app.post('/capturar-propinas', (req, res) => {
  const { monto } = req.body;
  totalTips += monto;
  res.json({ mensaje: 'Monto de propinas para empleados capturado exitosamente', totalTips});
});

// Ruta para dividir propinas
app.post('/dividir-propinas', (req, res) => {
  const { empleados } = req.body;
  const propinaPorEmpleado = totalTips / empleados;
  res.json({ mensaje: 'Propinas divididas entre empleados', propinaPorEmpleado });
});


app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
