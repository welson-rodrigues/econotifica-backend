const express = require("express");
require('./app/config/mqtt'); // ← isso inicia o serviço MQTT junto com o servidor
const cors = require("cors");
const app = express();
app.use(cors());
//app.use(cors(corsOptions));

app.use(express.json()); /* bodyParser.json() is deprecated */

app.use(express.urlencoded({ extended: true })); /*
bodyParser.urlencoded() is deprecated */
// simple route
app.get("/", (req, res) => {
    res.json({
        message: "Funcionando ate aqui" });
});
    require("./app/routes/rotas.routes.js")(app);

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server rodando na porta ${PORT}.`);
    });