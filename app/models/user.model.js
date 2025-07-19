const bcrypt = require("bcryptjs");
const pool = require("../config/db.config.js");

const Usuari = function (usuario) {
  this.tipo = usuario.tipo;
  this.nome = usuario.nome;
  this.senha = usuario.senha;
  this.bairro = usuario.bairro;
  this.email = usuario.email;
  this.cidade = usuario.cidade;
};

// Criar novo usuário com hash
Usuari.create = (usuario, result) => {
  bcrypt.hash(usuario.senha, 12, (err, hash) => {
    if (err) {
      return result(err, null);
    }

    pool.query(
      'INSERT INTO pessoa (tipo, nome, senha, bairro, email, cidade) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [usuario.tipo, usuario.nome, hash, usuario.bairro, usuario.email, usuario.cidade],
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        result(null, res.rows[0]);
      }
    );
  });
};

// Buscar usuário por email (sem autenticação)
Usuari.findByEmailOnly = (email, result) => {
  pool.query('SELECT * FROM pessoa WHERE email = $1', [email], (err, res) => {
    if (err) {
      result(err, null);
      return;
    }

    if (res.rows.length === 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    result(null, res.rows[0]);
  });
};

// ✅ Buscar e autenticar usuário por email e senha
Usuari.findByEmail = (email, senha, callback) => {
  pool.query('SELECT * FROM pessoa WHERE email = $1', [email], (err, res) => {
    if (err) {
      console.error('Erro na consulta:', err);
      return callback(err, null);
    }

    if (res.rows.length === 0) {
      return callback({ kind: "not_found" }, null);
    }

    const user = res.rows[0];

    // Comparar a senha com o hash
    bcrypt.compare(senha, user.senha, (err, isMatch) => {
      if (err) {
        console.error('Erro na comparação da senha:', err);
        return callback(err, null);
      }

      if (!isMatch) {
        return callback({ kind: "invalid_password" }, null);
      }

      callback(null, user);
    });
  });
};

// Atualizar senha com hash
Usuari.updateSenha = (email, novaSenha, result) => {
  bcrypt.hash(novaSenha, 12, (err, hash) => {
    if (err) {
      return result(err, null);
    }

    pool.query(
      'UPDATE pessoa SET senha = $1 WHERE email = $2 RETURNING *',
      [hash, email],
      (err, res) => {
        if (err) {
          result(err, null);
          return;
        }

        if (res.rows.length === 0) {
          result({ kind: "not_found" }, null);
          return;
        }

        result(null, res.rows[0]);
      }
    );
  });
};

module.exports = Usuari;
