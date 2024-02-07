<template>
  <div id="app">
  <div class="sidebar">
    <img alt="logo" src="/public/img/empresa.png">
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
      <h1 v-if="activeSection === 'tipForm'"></h1>
      <h1 v-if="activeSection === 'tipList'">Lista de Pagos de Propinas</h1>
      <div class="title_section">
        <div style="float:left">
          <h1>Pago de Propinas</h1>
        </div>
        <div  style="float:right; margin-right:30px">
          <h8>Efectivo en Caja</h8>
          <div><h2>$5.000.000</h2></div>
        </div>
      </div>
      <br>
      <div class="linea"></div>
      <div v-if="activeSection === 'tipForm'" class="tip-form">

      <div class="left-section">
          <label for="totalTips" class="totalPropinas">Total de Propinas:</label>
          <div class="resultadoPropinas">
            <h2  >{{totalTips.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }}</h2>
          </div>

          <label for="numEmpleados">¿Entre cúantos quieres dividir las
              Propinas?</label>
            <div  class="numEmpleados">
              <input v-model="numEmpleados" type="number" id="numEmpleados" class="numEmpleados" placeholder="Ingrese el número de empleados">
            </div>
          <div  class="numEmpleadosCount">
            <div v-if="showDistribution" >
              <p>{{ propinaPorEmpleado.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }} por persona.</p>
            </div>
            <div v-else >
              <p>$0.00 por persona.</p>
            </div>
          </div>

          <label for="paymentMethod" style="margin-top:100px">Elige el método de Pago:</label>
          <div class="payment-options">
            <button :class="{ selected: paymentMethod === 'cash' }" @click="setPaymentMethod('cash')">
              <img src="/public/img/money.png" alt="Efectivo">
            </button>
            <button :class="{ selected: paymentMethod === 'card' }" @click="setPaymentMethod('card')">
              <img src="/public/img/credit-card.png" alt="Tarjeta">
            </button>
          </div>
          <div div style="float:left">
            <div v-if="showDistribution" class="result-message">
              <p>Total Pagado:           {{ propinaPorEmpleado.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }}</p>
            </div>
            <div v-else class="result-message">
              <p>Total Pagado:        $0.00 </p>
            </div>
          </div>
        </div>
        <div class="right-section">
          <div class="calculator">
          <div class="total-tips-section">
            <span class="">$</span>
            <span class="total-tips-amount">{{ montoAsignar.toLocaleString('en-US', { style: 'currency', currency: 'USD' })   }}</span>
          </div>
          <hr>
            <div class="buttons">
              <button v-for="button in calculatorButtons" :key="button" @click="handleButtonClick(button)">
                {{ button }}
              </button>
            </div>
            <button class="assign-button" @click="assignTip">✔</button>


          </div>
          <div>
              <button class="button_pay" @click="submitTips">Pagar Propinas</button>
          </div>
        </div>
        <div class="">
          <div class="pay">
            <h3>Pagos</h3>

            <div v-if="showDistribution" class="resultados">
              {{paymentMethod}}  {{ propinaPorEmpleado.toLocaleString('en-US', { style: 'currency', currency: 'USD' })  }}
            </div>
            <div v-else class="resultados">
              Sin Pagos
            </div>

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
              <th>Recibo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in tipPayments" :key="index">
              <td>{{ payment.id }}</td>
              <td>{{ payment.dateTime }}</td>
              <td>{{ payment.persons }}</td>
              <td>{{ payment.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</td>
              <td>{{ payment.paymentType }}</td>
              <td>
                <button @click="descargarRecibo(payment)">Descargar Recibo</button>
              </td>
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
      numEmpleados: 0,
      paymentMethod: 'cash',
      showDistribution: false,
      propinaPorEmpleado: 0,
      montoAsignar: 0,
      calculatorButtons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00'],
      activeSection: 'tipForm',
      tipPayments: [],
      nombreEmpresa: "Nombre de tu empresa",
    };
  },
  watch: {
    numEmpleados: 'actualizarDistribucion',
  },
  methods: {
    async actualizarDistribucion() {
      try {
        let montoPropinas = this.totalTips;

        if (montoPropinas !== 0 && this.numEmpleados > 0) {
          montoPropinas /= this.numEmpleados;

          // Realizar la petición al servidor si es necesario
          await axios.post('http://localhost:3000/dividir-propinas', {
            empleados: this.numEmpleados,
          });

          this.propinaPorEmpleado = montoPropinas;
          this.showDistribution = true;

          // Limpiar la lista de propinas al actualizar la distribución
          this.tipPayments = [];

          // Agregar la nueva propina al arreglo
          this.tipPayments.push({
            id: this.tipPayments.length + 1,
            dateTime: new Date().toLocaleString(),
            amount: montoPropinas,
            persons: this.numEmpleados,
            paymentType: this.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta',
          });

          console.log('Distribución actualizada:', montoPropinas);
        }
      } catch (error) {
        console.error('Error al enviar propinas:', error);
      }
    },
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
      this.totalTips += this.montoAsignar;
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
    descargarRecibo(payment) {
      const contenidoRecibo = `
        Fecha: ${ payment.dateTime}
        Numero de personas: ${payment.persons}
        Monto por Persona: ${payment.amount}
        Tipo de Pago: ${payment.paymentType}
      `;
      const blob = new Blob([contenidoRecibo], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Recibo_${payment.id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  },
};
</script>

<style scoped>
#app {
  text-align: center;
  margin-top: 2em;
}

.title_section {
  text-align: center;
  margin-bottom: 100px;
}

.linea {
  border-top: 1px solid #bdb2b2;
  height: 0px;
  max-width: 920px;
  padding: 0;
  margin: 60px auto 0 auto;
}

hr {
border: 0;
border-bottom: 2px solid #bdb2b2;
height:0;
}

.main-section {
  display: flex;
  text-align: center;
  justify-content: space-around;
}

.tip-form {
  display: flex;
  justify-content: space-between;
  max-width: 950px;
  margin-top: 20px;
}

.left-section {
  width: 48%;
}

.right-section {
  width: 48%;
  margin:0 30px 0 50px;
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
  margin-bottom: 1em;
  margin-left:6em;
}

.payment-options button {
  width: 65px;
  height: 50px;
  background-color: #f7fff7;
  border-style: solid;
  border-color: #c0c7c0;
  color: black;
  border: 0;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

}

.numEmpleados {
  width: 50%;
  height: 40px;
  float: left;
  border-radius: 10px;
  cursor: pointer;
}

.numEmpleadosCount {
  width: 48%;
  height: 60px;
  float: right;
  border-radius: 20px;
  Color: #ee6f60;
  cursor: pointer;
}

.payment-options button img {
  width: 40px;
  height: 40px;
}

.payment-options button.selected {
  background-color: #ee6f60
;
}

button {
  width: 70px;
  height: 48px;
  font-size: 1.2em;
  margin: 0.2em;
  cursor: pointer;
}
.button_pay {
  width: 252px;
  height: 50px;
  font-size: 1em;
  margin: 2.2em;
  cursor: pointer;
  border: 0.1px;
  border-radius: 34px;
  float:right;
  Color: white;
  background-Color: #ee6f60;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.buttons button {
  background-Color:white;
  border-radius: 15px;
  border:0;

}

.calculator {
  margin-top: 1em;
  border: 1px solid #f5eded;
  border-radius: 19px;
  padding: 1em;
  background-color: #f5eded
}

.result-display {
  margin-top: 1em;
}

.assign-button {
  background-color: #ee6f60
;
  color: white;
  width: 20%;
  padding: 1em;
  font-size: 1em;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  float: right;
  margin-top: -50px;
  margin-right: 40px;
}

.result-message {
  margin-top: 1em;
  padding: 1em;
  color: #ee6f60;
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

.sidebar {
  width: 60px;
  background-color: #f5f5f5;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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
  transition: background-color 0.3s;
}

nav div:hover {
  background-color: #ddd;
}
h8 {
  Color: #ee6f60;
}

h2 {
  Color: #ee6f60;
  background-color:#fbdeda;
  border-radius: 5px;
}

.totalPropinas {
  Color: #ee6f60;
}

.resultadoPropinas  {
  Color: #ee6f60;
  background-color:#fbdeda;
  border-radius: 5px;
}

.resultados {
  Color: black;
  border-radius: 10px;
  border: 1px solid;
  width: 190px;
  height:25px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

nav div.active {
  background-color: #ee6f60;
  width: 30px;
  border-radius: 15px;
  color: white;
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
  margin-left: 100px;
}

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
