module.exports = app => {
  const Usuari = require("../controllers/user.controllers.js");
  const Lixo = require("../controllers/lixeira.controllers.js");
  const Cidade = require("../controllers/cidade.controllers.js");

  var router = require("express").Router();

  // rotas usuario
  router.post("/api/user", Usuari.create); // criar usuário

  router.get("/api/user", Usuari.findAll); // listar todos usuários

  // ALTERAÇÃO: trocar GET por POST para login
  router.post("/api/user/login", Usuari.findOne); // login (autenticação)

  // rotas lixeiras
  router.get("/api/lixeira", Lixo.findAll);

  router.put("/api/lixeira/:id", Lixo.update);

  // outras rotas não testadas
  router.put("/api/user/:id", Usuari.update);

  router.delete("/api/user/:id", Usuari.delete);

  router.delete("/api/user", Usuari.deleteAll);

  app.use("/", router);
};
