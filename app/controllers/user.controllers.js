const User = require("../models/user.model");

// Criar usuário
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Conteúdo vazio!" });
    return;
  }

  const user = new User({
    email: req.body.email,
    senha: req.body.senha,
  });

  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Erro ao criar usuário." });
    else res.send(data);
  });
};

// Login (com senha criptografada)
exports.findOne = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).send({ message: "Email e senha obrigatórios." });
    return;
  }

  User.findByEmail(email, senha, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: "Usuário não encontrado." });
      } else if (err.kind === "invalid_password") {
        res.status(401).send({ message: "Senha incorreta." });
      } else {
        res.status(500).send({ message: "Erro ao buscar usuário." });
      }
    } else {
      res.send(data);
    }
  });
};

// Atualizar senha
exports.updateSenha = (req, res) => {
  const { email, novaSenha } = req.body;

  if (!email || !novaSenha) {
    res.status(400).send({ message: "Email e nova senha são obrigatórios." });
    return;
  }

  // Primeiro verifica se o email existe
  User.findByEmail(email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: "Email não encontrado." });
      } else {
        res.status(500).send({ message: "Erro ao buscar usuário." });
      }
      return;
    }

    // Se o email existe, atualiza a senha
    User.updateSenha(email, novaSenha, (err, data) => {
      if (err) {
        res.status(500).send({ message: "Erro ao atualizar senha." });
      } else {
        res.send({ message: "Senha atualizada com sucesso." });
      }
    });
  });
};
