module.exports = app => {
  const Usuari = require("../controllers/user.controllers.js");
  const Lixo = require("../controllers/lixeira.controllers.js");
  const Cidade = require("../controllers/cidade.controllers.js");
  
  var router = require("express").Router();

  // Rotas usuario
  router.post("/api/user", Usuari.create);
  router.get("/api/user", Usuari.findAll);
  router.post("/api/user/login", Usuari.findOne);
  
  // Nova rota para verificar email
  router.post("/api/user/check-email", Usuari.checkEmail);
  
  // Rota para atualizar senha
  router.put("/api/user/senha", Usuari.updateSenha);

  // Rotas lixeiras
  router.get("/api/lixeira", Lixo.findAll);
  router.put("/api/lixeira/:id", Lixo.update);

  // Outras rotas
  router.put("/api/user/:id", Usuari.update);
  router.delete("/api/user/:id", Usuari.delete);
  router.delete("/api/user", Usuari.deleteAll);

  // Nova rota para verificar email
  router.post("/api/user/check-email", (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email é obrigatório" });
    }
  
    User.findByEmailOnly(email, (err, user) => {
      if (err) {
        return res.status(404).json({ 
          success: false, 
          message: "Email não encontrado" 
        });
      }
      res.json({ 
        success: true, 
        message: "Email encontrado",
        exists: true 
      });
    });
  });

  app.use("/", router);
};
