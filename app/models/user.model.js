const pool = require("../config/db.js");
const bcrypt = require("bcrypt");

// constructor Fixass
const Usuari = function (user) {
  this.nome = user.nome;
  this.email = user.email;
  this.senha = user.senha;
  this.tipo = user.tipo;
  this.bairro = user.bairro;
  this.cidade = user.cidade;
  //user = user, Fixass = Usuari
};

Usuari.create = (NewUser, result) => {

    pool.query(
      "INSERT INTO pessoa (nome, email, senha, tipo, bairro, cidade) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        NewUser.nome,
        NewUser.email,
        NewUser.senha,
        NewUser.tipo,
        NewUser.bairro,
        parseInt(NewUser.cidade),
      ],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        } else {
          result(null, { nome: res.nome, ...NewUser });
        }
      }
    );
};


Usuari.findById = (User, result) => {
    console.log('findById user = ', User)

        pool.query('SELECT * FROM pessoa WHERE email = $1 and senha = $2', [User.email, User.senha], (err,
            res) => {
            if (err) {
                //throw error
                console.log("error: ", err);
                result(err, null);
                return ;
            }
            if (res.rows.length) {
                console.log("pessoa: ", res.rows[0]);
                result(null, res.rows[0]);
                return;
            }
            
            console.log("user nao encontrado: res.length = ", res);
            result({ kind: "not_found" }, null);
        });

};

// Usuari.getAll = (nome, result) => {
//     let query = "SELECT * FROM user";
//     if (nome) {
//         query += " WHERE nome ILIKE $1", [`%${id}%`];
//     }
//     pool.query(query, (err, res) => {
//         if (err) {
//             console.log("error: ", err);
//             result(null, err);
//             return;
//         }
//         // console.log("user: ", res.rows);
//         result(null, res);
//     });
// };


Usuari.getAll = ( result) => {
  let query = "SELECT * FROM pessoa";

  pool.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("user: ", res.rows);
    result(null, res);
  });
};

// APARTIR DAQUI NÃO FOI TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO 
// APARTIR DAQUI NÃO FOI TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO 
// APARTIR DAQUI NÃO FOI TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO // CODIGO NÃO TESTADO 

Usuari.updateById = (id, user, result) => {
    console.log(user)
    pool.query(
      "UPDATE pessoa SET nome = $1 , email = $2, senha = $3, tipo = $4, bairro = $5 WHERE id = $6",
      [
        user.nome,
        user.email,
        user.senha,
        user.tipo,
        user.bairro,
        id
      ],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
        if (res.affectedRows == 0) {
          // not found Aluno with the id
          result({ kind: "not_found" }, null);
          return;
        }
        console.log("updated user: ", { id: id });
        result(null, { id: id });
      }
    );
};

Usuari.remove = (id, result) => {
    pool.query("DELETE FROM user WHERE id = $1", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows == 0) {
            // not found Aluno with the id
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("deleted user with id: ", id);
        result(null, res);
    });
};
Usuari.removeAll = result => {
    pool.query("DELETE FROM user", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        console.log(`deleted ${res.affectedRows} user`);
        result(null, res);
    });
};
module.exports = Usuari;


//Buscar usuário por email
Usuari.findByEmail = (email, senha, result) => {
  pool.query('SELECT * FROM pessoa WHERE email = $1', [email], (err, res) => {
    if (err) {
      result(err, null);
      return;
    }

    if (res.rows.length === 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    const user = res.rows[0];

    // Comparar senha
    bcrypt.compare(senha, user.senha, (err, same) => {
      if (err) {
        result(err, null);
        return;
      }

      if (!same) {
        result({ kind: "invalid_password" }, null);
        return;
      }

      result(null, user);
    });
  });
};

// Atualizar senha
Usuari.updateSenha = (email, novaSenha, result) => {
  console.log("Atualizando senha de:", email);

  // Criptografar a nova senha
  bcrypt.hash(novaSenha, 10, (err, hash) => {
    if (err) {
      console.log("Erro ao criptografar senha:", err);
      result(err, null);
      return;
    }

    pool.query(
      "UPDATE pessoa SET senha = $1 WHERE email = $2",
      [hash, email],
      (err, res) => {
        if (err) {
          console.log("Erro ao atualizar senha:", err);
          result(err, null);
          return;
        }

        if (res.rowCount === 0) {
          result({ kind: "not_found" }, null);
          return;
        }

        result(null, res);
      }
    );
  });
};
