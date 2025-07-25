const User = require("../models/user.model");

// SUA FUNÇÃO ORIGINAL (mantida intacta)
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Conteúdo vazio!" });
    return;
  }

  const user = new User({
    tipo: req.body.tipo,       // Adicionado
    nome: req.body.nome,       // Adicionado
    email: req.body.email,
    senha: req.body.senha,
    bairro: req.body.bairro,   // Adicionado
    cidade: req.body.cidade    // Adicionado
  });

  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Erro ao criar usuário." });
    else res.send(data);
  });
};

// MINHA ADIÇÃO (nova função com tratamento aprimorado)
exports.createWithValidation = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ 
      success: false,
      message: "Dados de cadastro não fornecidos" 
    });
  }

  User.createWithValidation(req.body, (err, data) => {
    if (err) {
      let status = 500;
      let message = "Erro ao criar usuário";

      if (err.kind === "missing_fields") {
        status = 400;
        message = "Preencha todos os campos obrigatórios";
      } else if (err.kind === "email_exists") {
        status = 409;
        message = "Email já cadastrado";
      } else if (err.kind === "invalid_email") {
        status = 400;
        message = "Email inválido";
      }

      return res.status(status).json({ 
        success: false,
        message 
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: data.id,
        tipo: data.tipo,
        nome: data.nome,
        email: data.email,
        bairro: data.bairro,
        cidade: data.cidade
      },
      message: "Usuário cadastrado com sucesso"
    });
  });
};

// SUAS FUNÇÕES ORIGINAIS (mantidas intactas)
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

exports.updateSenha = (req, res) => {
  const { email, novaSenha } = req.body;

  if (!email || !novaSenha) {
    console.log('Email ou senha não fornecidos');
    return res.status(400).json({ 
      success: false,
      message: "Email e nova senha são obrigatórios" 
    });
  }

  User.findByEmailOnly(email, (err, user) => {
    if (err) {
      console.error('Erro ao verificar email:', err);
      return res.status(404).json({
        success: false,
        message: "Email não encontrado"
      });
    }

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

exports.salvarExpoToken = (req, res) => {
  const { userId, expoToken } = req.body;

  if (!userId || !expoToken) {
    return res.status(400).json({ message: "userId e expoToken são obrigatórios" });
  }

  User.salvarExpoToken(userId, expoToken, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      return res.status(500).json({ message: "Erro ao salvar token" });
    }

    res.status(200).json({
      message: "Token salvo com sucesso",
      user: data
    });
  });
};