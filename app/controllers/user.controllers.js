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

// Verificar se email existe (nova função)
exports.checkEmail = (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).send({ message: "Email é obrigatório." });
    return;
  }

  User.findByEmailOnly(email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: "Email não encontrado." });
      } else {
        res.status(500).send({ message: "Erro ao verificar email." });
      }
    } else {
      res.send({ message: "Email encontrado.", exists: true });
    }
  });
};

// Função para atualizar senha (completa e testada)
exports.updateSenha = (req, res) => {
  const { email, novaSenha } = req.body;

  if (!email || !novaSenha) {
    console.log('Email ou senha não fornecidos');
    return res.status(400).json({ 
      success: false,
      message: "Email e nova senha são obrigatórios" 
    });
  }

  console.log(`Recebida solicitação para atualizar senha de: ${email}`);

  // Verifica primeiro se o email existe
  User.findByEmailOnly(email, (err, user) => {
    if (err) {
      console.error('Erro ao verificar email:', err);
      return res.status(404).json({
        success: false,
        message: "Email não encontrado"
      });
    }

    // Atualiza a senha
    User.updateSenha(email, novaSenha, (updateErr, result) => {
      if (updateErr) {
        console.error('Erro ao atualizar senha:', updateErr);
        
        let message = "Erro ao atualizar senha";
        if (updateErr.kind === "not_found") message = "Email não encontrado";
        if (updateErr.kind === "update_failed") message = "Falha ao atualizar no banco de dados";
        if (updateErr.kind === "verification_failed") message = "Senha atualizada mas falha na verificação";

        return res.status(500).json({
          success: false,
          message
        });
      }

      console.log(`Senha atualizada com sucesso para: ${email}`);
      res.json({
        success: true,
        message: "Senha atualizada com sucesso",
        email: result.email
      });
    });
  });
};
