const mqtt = require('mqtt');
const db = require('./db');
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
    const { serial, distancia, nivel, temperatura } = payload;

    console.log('📨 Dados recebidos:', payload);

    // Validação básica
    if (!serial || distancia === undefined || nivel === undefined) {
      console.warn('⚠️ Dados incompletos recebidos, ignorando:', payload);
      return;
    }

    const query = `
      INSERT INTO sensor_data (serial, distancia, nivel, temperatura, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    const values = [serial, distancia, nivel, temperatura ?? null];
    await db.query(query, values);

    console.log('✅ Dados salvos no banco com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao processar mensagem MQTT:', err);
  }
});
