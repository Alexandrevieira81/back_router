import express from 'express';
import router from './router.js';
import cors from 'cors';
import { createTableUsuarios, createTableBlacklist } from './controller/Usuarios.js';
import { createTableRota, createTableSegmento, createTableSegmentoRota } from './controller/Rotas.js';
import { createTableSegmentos } from './controller/Segmentos.js';
import { createTablePontos } from './controller/Pontos.js';
import { Logados } from './controller/Logados.js';
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);
createTableUsuarios();
createTableBlacklist();
createTableRota();
createTableSegmento();
createTableSegmentoRota();
createTablePontos();
createTableSegmentos();

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).json({
    "success": false,
    "message": "Formato de requisição com problemas!"
  });
});

app.listen(3000, () => console.log("Funcionando"))