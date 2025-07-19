const pool = require("../config/db.js");
const bcrypt = require("bcrypt");

const Usuari = function (user) {
  this.nome = user.nome;
  this.email = user.email;
  this.senha = user.senha;
  this.tipo = user.tipo;
  this.bairro = user.bairro;
  this.cidade = user.cidade;
};

// [...] (mantenha as outras funções existentes)

// Buscar usuário por email (sem verificar senha - nova função)
Usuari.findByEmailOnly = (email, result) => {
  pool.query('SELECT * FROM pessoa WHERE email = $1', [email], (err, res) => {
    if (err) {
      console.error("Erro ao buscar email:", err);
      result(err, null);
      return;
    }

    if (res.rows.length === 0) {
      console.log("Email não encontrado:", email);
      result({ kind: "not_found" }, null);
      return;
    }

    result(null, res.rows[0]);
  });
};

// Atualizar senha (versão corrigida)
Usuari.updateSenha = (email, novaSenha, result) => {
  console.log(`Iniciando atualização de senha para: ${email}`);

  // Criptografar a nova senha
  bcrypt.hash(novaSenha, 10, (err, hash) => {
    if (err) {
      console.error("Erro ao criptografar senha:", err);
      result(err, null);
      return;
    }

    pool.query(
      "UPDATE pessoa SET senha = $1 WHERE email = $2 RETURNING email",
      [hash, email],
      (err, res) => {
        if (err) {
          console.error("Erro na query de atualização:", err);
          result(err, null);
          return;
        }

        if (res.rowCount === 0) {
          console.log("Nenhum registro afetado - email não encontrado:", email);
          result({ kind: "not_found" }, null);
          return;
        }

        console.log(`Senha atualizada para: ${email}`);
        result(null, { email: res.rows[0].email, updated: true });
      }
    );
  });
};
