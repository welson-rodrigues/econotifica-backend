const bcrypt = require("bcryptjs");
const pool = require("../config/db.js");

const Usuari = function (usuario) {
  this.tipo = usuario.tipo;
  this.nome = usuario.nome;
  this.senha = usuario.senha;
  this.bairro = usuario.bairro;
  this.email = usuario.email;
  this.cidade = usuario.cidade;
};

Usuari.create = (usuario, result) => {
  // Validação de campos obrigatórios
  if (!usuario.tipo || !usuario.nome || !usuario.email || !usuario.senha || !usuario.cidade) {
    return result({ kind: "missing_fields" }, null);
  }

  // Validação básica de email
  if (!usuario.email.includes('@') || !usuario.email.includes('.')) {
    return result({ kind: "invalid_email" }, null);
  }

  bcrypt.hash(usuario.senha, 12, (err, hash) => {
    if (err) {
      return result(err, null);
    }

    pool.query(
      `INSERT INTO pessoa 
      (tipo, nome, email, senha, bairro, cidade) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, tipo, nome, email, bairro, cidade`,
      [
        usuario.tipo,
        usuario.nome,
        usuario.email.toLowerCase(), // Normaliza email
        hash,
        usuario.bairro || null,
        usuario.cidade
      ],
      (err, res) => {
        if (err) {
          // Verifica se é erro de email duplicado
          if (err.code === '23505') {
            return result({ kind: "email_exists" }, null);
          }
          return result(err, null);
        }
        result(null, res.rows[0]);
      }
    );
  });
};

// ... (outras funções do model permanecem iguais)

module.exports = Usuari;