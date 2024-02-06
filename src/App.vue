<template>
  <div id="app">
  <div class="sidebar">
    <img src="company-logo.png" alt="Empresa" class="company-logo">
    <nav>
      <div @click="showTipForm" :class="{ active: activeSection === 'tipForm' }">
        <span>Propinas</span>
      </div>
      <div @click="showTipList" :class="{ active: activeSection === 'tipList' }">
        <span>Pagos</span>
      </div>
    </nav>
  </div>


    <div class="main-content">
      <h1 v-if="activeSection === 'tipForm'">Pago de Propinas</h1>
      <h1 v-if="activeSection === 'tipList'">Lista de Pagos de Propinas</h1>

      <div v-if="activeSection === 'tipForm'" class="tip-form">
        <div class="left-section">
          <label for="totalTips">Monto Total de Propinas:</label>
          <span class="total-tips-amount">{{totalTips.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }}</span>

          <label for="divideTips">Dividir Propinas entre Empleados:</label>
          <input v-model="divideTips" type="checkbox" id="divideTips">

          <label for="numEmpleados">Número de Empleados:</label>
          <input v-model="numEmpleados" type="number" id="numEmpleados" placeholder="Ingrese el número de empleados">

          <label for="paymentMethod">Método de Pago:</label>
          <div class="payment-options">
            <button :class="{ selected: paymentMethod === 'cash' }" @click="setPaymentMethod('cash')">
              <img src="cash-icon.png" alt="Efectivo">
            </button>
            <button :class="{ selected: paymentMethod === 'card' }" @click="setPaymentMethod('card')">
              <img src="card-icon.png" alt="Tarjeta">
            </button>
          </div>

          <button class="button_pay" @click="submitTips">Pagar Propinas</button>

          <div v-if="showDistribution" class="result-message">
            <p>Las propinas se dividen {{ propinaPorEmpleado.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }} por persona.</p>
          </div>
        </div>

        <div class="right-section">
          <div class="total-tips-section">
            <span class="total-tips-label">Total Propinas:</span>
            <span class="total-tips-amount">{{ totalTips.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }}</span>
          </div>

          <div class="calculator">
            <div class="buttons">
              <button v-for="button in calculatorButtons" :key="button" @click="handleButtonClick(button)">
                {{ button }}
              </button>
            </div>

            <div class="result-display">
              <p>Monto a asignar:</p>
              <span>{{ montoAsignar.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }}</span>
            </div>

            <button class="assign-button" @click="assignTip">✔</button>
          </div>
        </div>
      </div>

      <div v-if="activeSection === 'tipList'" class="tip-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Día y Hora</th>
              <th># de Personas</th>
              <th>Monto por Persona</th>
              <th>Tipo de Pago</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in tipPayments" :key="index">
              <td>{{ payment.id }}</td>
              <td>{{ payment.dateTime }}</td>
              <td>{{ payment.persons }}</td>
              <td>{{ payment.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</td>
              <td>{{ payment.paymentType }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      totalTips: 0,
      divideTips: false,
      numEmpleados: 1,
      paymentMethod: 'cash',
      showDistribution: false,
      propinaPorEmpleado: 0,
      montoAsignar: 0,
      calculatorButtons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', '✔'],
      activeSection: 'tipForm',
      tipPayments: [],
    };
  },
  methods: {
    async submitTips() {
      try {
        let montoPropinas = this.totalTips;

        montoPropinas /= this.numEmpleados;

        await axios.post('http://localhost:3000/dividir-propinas', {
          empleados: this.numEmpleados,
        });

        this.propinaPorEmpleado = montoPropinas;
        this.showDistribution = true;

        const response = await axios.post('http://localhost:3000/capturar-propinas', {
          monto: montoPropinas,
        });
        this.totalTips = 0;

        this.tipPayments.push({
          id: this.tipPayments.length + 1,
          dateTime: new Date().toLocaleString(),
          amount: montoPropinas,
          persons: this.numEmpleados,
          paymentType: this.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta',
        });

        console.log(response.data);
      } catch (error) {
        console.error('Error al enviar propinas:', error);
      }
    },
    handleButtonClick(button) {
      if (button === '✔') {
        this.assignTip();
      } else {
        this.montoAsignar = this.montoAsignar * 10 + parseInt(button);
      }
    },
    assignTip() {
      this.totalTips += this.montoAsignar; // Restar el monto asignado del totalTips
      this.showSuccessMessage();
    },
    showSuccessMessage() {
      alert('Propina asignada correctamente');
      this.montoAsignar = 0;
    },

    setPaymentMethod(method) {
      // Cambiar el método de pago
      this.paymentMethod = method;
    },
    showTipForm() {
      this.activeSection = 'tipForm';
    },
    showTipList() {
      this.activeSection = 'tipList';
    },
  },
};
</script>
<style scoped>
#app {
  text-align: center;
  margin-top: 2em;
}

.tip-form {
  display: flex;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
}

.left-section {
  width: 48%;
}

.right-section {
  width: 48%;
}

label {
  display: block;
  margin-bottom: 0.5em;
}

input, select {
  width: 100%;
  padding: 0.5em;
  margin-bottom: 1em;
  box-sizing: border-box;
}

.payment-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1em;
}

.payment-options button {
  width: 48%;
  height: 60px;
  background-color: #f7fff7;
  border-width: 4px;
  border-style: solid;
  border-color: #c0c7c0;
  color: black;
  border-radius: 34px;
  cursor: pointer;
}

.payment-options button img {
  width: 40px;
  height: 40px;
}

.payment-options button.selected {
  background-color: #ed5252;
}

button {
  width: 70px;
  height: 48px;
  font-size: 1.2em;
  margin: 0.2em;
  cursor: pointer;
}
.button_pay {
  width: 100px;
  height: 80px;
  font-size: 1em;
  margin: 0.2em;
  cursor: pointer;
  border-radius: 34px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.calculator {
  margin-top: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1em;
  background-color: #f5eded
}

.result-display {
  margin-top: 1em;
}

.assign-button {
  background-color: #ed5252;
  color: white;
  width: 80%;
  padding: 1em;
  font-size: 1em;
  border: none;
  border-radius: 18px;
  cursor: pointer;
}

.result-message {
  margin-top: 1em;
  padding: 1em;
  background-color: #e6f7e8;
  border: 1px solid #ed5252;
  border-radius: 5px;
  color: #ed5252;
}

.total-tips-section {
  margin-top: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-tips-label {
  color: #d9534f;
  font-weight: bold;
}

.total-tips-amount {
  color: #d9534f;
  font-size: 1.2em;
}

.sidebar {
  width: 200px;
  background-color: #f5f5f5; /* Color más neutro */
  color: #333; /* Texto más oscuro para contraste */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Sutil sombra */
  float: left
}

.sidebar img {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

nav div {
  margin-bottom: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s; /* Transición suave en el cambio de color */
}

nav div:hover {
  background-color: #ddd; /* Color de fondo al pasar el ratón */
}

nav div.active {
  background-color: #ed5252; /* Color de fondo cuando está activo */
  color: white; /* Texto en color blanco cuando está activo */
}


nav div img {
  width: 40px;
  height: 40px;
}

nav div span {
  margin-top: 5px;
}

nav div.active {
  color: white;
}

.company-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.main-content {
  margin-left: 220px;
}

/* Estilo adicional para la sección de Lista de Pagos */
.tip-list table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.tip-list th, .tip-list td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.tip-list th {
  background-color: #f5f5f5;
}

</style>
