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

// Função de criação original
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

// Função de criação com validação
Usuari.createWithValidation = (usuario, result) => {
  if (!usuario.tipo || !usuario.nome || !usuario.email || !usuario.senha || !usuario.cidade) {
    return result({ kind: "missing_fields" }, null);
  }
  if (!usuario.email.includes('@') || !usuario.email.includes('.')) {
    return result({ kind: "invalid_email" }, null);
  }
  bcrypt.hash(usuario.senha, 12, (err, hash) => {
    if (err) {
      return result(err, null);
    }
    pool.query(
      `INSERT INTO pessoa (tipo, nome, email, senha, bairro, cidade) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, tipo, nome, email, bairro, cidade`,
      [
        usuario.tipo,
        usuario.nome,
        usuario.email.toLowerCase(),
        hash,
        usuario.bairro || null,
        usuario.cidade
      ],
      (err, res) => {
        if (err) {
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

// -- ESTA É A FUNÇÃO CORRIGIDA E COMPLETA PARA BUSCAR O PERFIL --
Usuari.findById = (id, result) => {
  let usuarioFinal;

  // Passo 1: Buscar os dados do usuário e o nome da cidade com um JOIN.
  const queryUsuario = `
    SELECT 
      p.id, 
      p.nome, 
      p.email, 
      p.bairro,
      c.nome AS "cidadeNome"
    FROM pessoa p
    JOIN cidade c ON p.cidade = c.id
    WHERE p.id = $1;
  `;

  pool.query(queryUsuario, [id], (err, res) => {
    if (err) {
      console.error("Erro ao buscar usuário e cidade:", err);
      return result(err, null);
    }

    if (res.rows.length === 0) {
      return result({ kind: "not_found" }, null);
    }

    usuarioFinal = res.rows[0];

    // Passo 2: Buscar as lixeiras associadas a essa pessoa.
    const queryLixeiras = `
      SELECT 
        l.id, 
        l.nome, 
        l.situacao 
      FROM lixeira l
      JOIN grupo g ON l.id = g.lixeira
      WHERE g.pessoa = $1;
    `;

    pool.query(queryLixeiras, [id], (errLixeiras, resLixeiras) => {
      if (errLixeiras) {
        console.error("Erro ao buscar lixeiras:", errLixeiras);
        return result(errLixeiras, null);
      }

      // Passo 3: Adiciona o array de lixeiras ao objeto do usuário.
      usuarioFinal.lixeiras = resLixeiras.rows;

      // Passo 4: Retorna o objeto completo.
      console.log("Usuário completo encontrado:", usuarioFinal);
      result(null, usuarioFinal);
    });
  });
};

// Função para buscar apenas por email (usada na recuperação de senha)
Usuari.findByEmailOnly = (email, result) => {
  pool.query('SELECT * FROM pessoa WHERE email = $1', [email], (err, res) => {
    if (err) {
      return result(err, null);
    }
    if (res.rows.length === 0) {
      return result({ kind: "not_found" }, null);
    }
    result(null, res.rows[0]);
  });
};

// Função de login
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

// Função para atualizar a senha
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
          return result(err, null);
        }
        if (res.rows.length === 0) {
          return result({ kind: "not_found" }, null);
        }
        result(null, res.rows[0]);
      }
    );
  });
};

// Função para salvar o token de notificação
Usuari.salvarExpoToken = (userId, expoToken, result) => {
  pool.query(
    'UPDATE pessoa SET expo_push_token = $1 WHERE id = $2 RETURNING id, nome, email',
    [expoToken, userId],
    (err, res) => {
      if (err) {
        return result(err, null);
      }
      if (res.rows.length === 0) {
        return result({ kind: "not_found" }, null);
      }
      result(null, res.rows[0]);
    }
  );
};

module.exports = Usuari;
