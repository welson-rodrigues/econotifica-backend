module.exports = app => {
  const Usuari = require("../controllers/user.controllers.js");
  const Lixo = require("../controllers/lixeira.controllers.js");
  const Cidade = require("../controllers/cidade.controllers.js");
  const Sensor = require("../controllers/sensor.controller.js");

  var router = require("express").Router();

  // SUAS ROTAS ORIGINAIS (mantidas intactas)
  router.post("/api/user", Usuari.create); // Rota original
  router.post("/api/user/login", Usuari.findOne);
  router.post("/api/user/check-email", Usuari.checkEmail);
  router.put("/api/user/senha", Usuari.updateSenha);
  router.get("/api/lixeira", Lixo.findAll);
  router.put("/api/lixeira/:id", Lixo.update);

  router.get("/api/lixeira/:id", Lixo.findOne); // novo

  router.post("/api/user/token", Usuari.salvarExpoToken);
  router.get("/api/lixeiras", Sensor.getUltimosDadosSensor);

  // MINHA ADIÇÃO (nova rota para cadastro com validação)
  router.post("/api/user/validated", Usuari.createWithValidation);
  

  app.use("/", router);
};