const mqtt = require('mqtt');
const db = require('./db');
const { Pool } = require('pg');
require('dotenv').config();

const BROKER = 'mqtt://192.168.1.20';
const TOPICO = 'lixeiras/+';
const USUARIO = 'iot';
const SENHA = '059898';

// Conexão MQTT
const client = mqtt.connect(BROKER, {
  username: USUARIO,
  password: SENHA,
});

client.on('connect', () => {
  console.log('📡 Conectado ao MQTT Broker');
  client.subscribe(TOPICO, (err) => {
    if (err) console.error('Erro ao se inscrever:', err);
    else console.log('📥 Inscrito no tópico:', TOPICO);
  });
});

client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const { serial, distancia, nivel } = payload;

    console.log('📨 Dados recebidos:', payload);

    const query = `
      INSERT INTO sensor_data (serial, distancia, nivel, timestamp)
      VALUES ($1, $2, $3, NOW())
    `;
    const values = [serial, distancia, nivel];
    await db.query(query, values);

  } catch (err) {
    console.error('⚠️ Erro ao processar mensagem MQTT:', err);
  }
});
