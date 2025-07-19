const pool = require("../config/db.js");
const bcrypt = require("bcrypt");

const Usuari = function(user) {
  this.nome = user.nome;
  this.email = user.email;
  this.senha = user.senha;
  this.tipo = user.tipo;
  this.bairro = user.bairro;
  this.cidade = user.cidade;
};

// Função para buscar usuário apenas por email (sem verificar senha)
Usuari.findByEmailOnly = (email, callback) => {
  pool.query('SELECT * FROM pessoa WHERE email = $1', [email], (err, res) => {
    if (err) {
      console.error('Erro ao buscar email:', err);
      return callback(err, null);
    }
    if (res.rows.length === 0) {
      return callback({ kind: "not_found" }, null);
    }
    callback(null, res.rows[0]);
  });
};

// Função para atualizar senha (versão corrigida)
Usuari.updateSenha = (email, novaSenha, callback) => {
  console.log(`Iniciando atualização de senha para: ${email}`);
  
  // Primeiro verifica se o email existe
  pool.query('SELECT * FROM pessoa WHERE email = $1', [email], (err, res) => {
    if (err) {
      console.error('Erro ao verificar email:', err);
      return callback(err);
    }
    
    if (res.rows.length === 0) {
      console.log('Email não encontrado:', email);
      return callback({ kind: "not_found" });
    }

    // Criptografa a nova senha
    bcrypt.hash(novaSenha, 10, (hashErr, hash) => {
      if (hashErr) {
        console.error('Erro ao gerar hash:', hashErr);
        return callback(hashErr);
      }

      // Atualiza a senha no banco
      pool.query(
        'UPDATE pessoa SET senha = $1 WHERE email = $2 RETURNING *',
        [hash, email],
        (updateErr, updateRes) => {
          if (updateErr) {
            console.error('Erro ao atualizar senha:', updateErr);
            return callback(updateErr);
          }

          if (updateRes.rows.length === 0) {
            console.log('Nenhum registro atualizado para:', email);
            return callback({ kind: "update_failed" });
          }

          console.log('Senha atualizada com sucesso para:', email);
          
          // Verifica se a senha foi realmente atualizada
          pool.query('SELECT senha FROM pessoa WHERE email = $1', [email], (verifyErr, verifyRes) => {
            if (verifyErr) {
              console.error('Erro ao verificar senha atualizada:', verifyErr);
              return callback(verifyErr);
            }

            const senhaAtualizada = verifyRes.rows[0].senha;
            
            // Compara a nova senha com o hash armazenado
            bcrypt.compare(novaSenha, senhaAtualizada, (compareErr, isMatch) => {
              if (compareErr) {
                console.error('Erro ao comparar senhas:', compareErr);
                return callback(compareErr);
              }

              if (!isMatch) {
                console.error('A senha no banco não corresponde ao hash esperado');
                return callback({ kind: "verification_failed" });
              }

              console.log('Senha verificada com sucesso para:', email);
              callback(null, { success: true, email });
            });
          });
        }
      );
    });
  });
};

// ... (mantenha as outras funções existentes)

module.exports = Usuari;
