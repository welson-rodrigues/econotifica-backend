const User = require("../models/user.model.js");

// Criar usuário
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "body vaziu" });
    return;
  }

  const UserBody = new User({
    nome: req.body.nome || null,
    email: req.body.email || null,
    senha: req.body.senha || null,
    tipo: req.body.tipo || null,
    bairro: req.body.bairro || null,
    cidade: req.body.cidade || null,
  });

  User.create(UserBody, (err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Erro ao criar User (controllers)" });
    else res.send(data);
  });
};

// Buscar todos usuários
exports.findAll = (req, res) => {
  User.getAll((err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "(controllers) Erro ao puxar os dados" });
    else res.status(200).json(data.rows);
  });
};

// AUTENTICAÇÃO - ESPERA email e senha no corpo da requisição (POST)
exports.findOne = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "body vaziu" });
    return;
  }

  const body = new User({
    email: req.body.email || null,
    senha: req.body.senha || null,
  });

  User.findById(body, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `(controllers) pessoa não existe.` });
      } else {
        res.status(500).send({ message: "Erro ao buscar (controllers)" });
      }
    } else res.send(data);
  });
};

// outros métodos ...
