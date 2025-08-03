const db = require('../config/db');

exports.getUltimosDadosSensor = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT ON (serial)
        serial,
        distancia,
        nivel,
        temperatura,
        timestamp
      FROM sensor_data
      ORDER BY serial, timestamp DESC
    `);

    const lixeiras = result.rows.map((item) => {
      const distancia = parseFloat(item.distancia);
      const capacidade = 30; // em cm — ajuste conforme necessário
      const porcentagem = Math.min(100, Math.max(0, ((capacidade - distancia) / capacidade) * 100));

      return {
        nome: `Lixeira ${item.serial}`,
        serial: item.serial,
        situacao: item.nivel,
        conectado: true,
        porcentagem: Math.round(porcentagem),
        temperatura: item.temperatura !== null ? Number(item.temperatura) : null,
      };
    });

    res.json(lixeiras);
  } catch (err) {
    console.error('Erro ao buscar últimos dados do sensor:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
};
