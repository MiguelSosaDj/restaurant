<template>
  <div id="app">
    <h1>Facilitar el Pago de Propinas en un Restaurante</h1>

    <div class="tip-form">
      <label for="totalTips">Monto Total de Propinas:</label>
      <input v-model="totalTips" type="number" id="totalTips" placeholder="Ingrese el monto total">

      <label for="divideTips">Dividir Propinas entre Empleados:</label>
      <input v-model="divideTips" type="checkbox" id="divideTips">

      <label for="numEmpleados">Número de Empleados:</label>
      <input v-model="numEmpleados" type="number" id="numEmpleados" placeholder="Ingrese el número de empleados">

      <label for="paymentMethod">Método de Pago:</label>
      <select v-model="paymentMethod" id="paymentMethod">
        <option value="cash">Efectivo</option>
        <option value="card">Tarjeta</option>
        <!-- Agrega más opciones según sea necesario -->
      </select>

      <button @click="submitTips">Pagar Propinas</button>

      <div v-if="showDistribution" class="result-message">
        <p>Las propinas se dividen ${{ propinaPorEmpleado.toFixed(2) }} por persona.</p>
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
      numEmpleados: 1, // Añadido para el número de empleados
      paymentMethod: 'cash',
      showDistribution: false,
      propinaPorEmpleado: 0,
    };
  },
  methods: {
    async submitTips() {
      try {
        let montoPropinas = this.totalTips;

          // Dividir el monto total entre el número de empleados
          montoPropinas /= this.numEmpleados;

          // Realizar la solicitud al nuevo punto final para dividir propinas
          await axios.post('http://localhost:3000/dividir-propinas', {
            empleados: this.numEmpleados,
          });

          // Calcular el monto de propinas por empleado
          this.propinaPorEmpleado = montoPropinas;
          this.showDistribution = true; // Mostrar el mensaje


        // Solicitud para capturar propinas
        const response = await axios.post('http://localhost:3000/capturar-propinas', {
          monto: montoPropinas,
        });

        console.log(response.data);
      } catch (error) {
        console.error('Error al enviar propinas:', error);
      }
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
  max-width: 400px;
  margin: 0 auto;
  padding: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

button {
  background-color: #4caf50;
  color: white;
  padding: 0.7em 1em;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.result-message {
  margin-top: 1em;
  padding: 1em;
  background-color: #e6f7e8;
  border: 1px solid #5cb85c;
  border-radius: 5px;
  color: #4cae4c;
}
</style>
